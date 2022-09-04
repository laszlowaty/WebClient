import React from 'react';
import { io, Socket } from 'socket.io-client';
import he from 'he';
import Ansi from '../components/common/Ansi';
import stripAnsi from 'strip-ansi';

import { observable, action } from 'mobx';
import { ConsoleLine, ConnSettings } from './types';
import { CONN_STATUS_CODE } from '../common/system';

class Connection {
  CONSOLE_LIMIT = 1000;
  BLOCK_FOLLOWED_BY_PRESS_ENTER_REGEX = /([\s\S]*)\[Naci.nij Enter aby kontynuowa.\]/;
  /**
   * The main console window will only receive React Nodes, they will never get changed.
   * Therefore we are not observing the log itself, only its count.
   */
  console = new Array<ConsoleLine>();
  @observable consoleCount = 0;
  @observable connected: boolean = false;
  @observable hasPrompt: boolean = false;
  @observable status: string = '';
  @observable maskEcho: boolean = false;

  @observable settings: ConnSettings = {
    echo: true,
    keepAlive: true,
    proxyProtocol: 'https',
    proxyHost: 'killer-mud.pl',
    proxyPort: '8080',
  };

  sock: Socket | null = null;
  keepAliveTimer: number | null = null;

  constructor() {
    if (this.sock === null) {
      this.sock = io(`${this.settings.proxyProtocol}://${this.settings.proxyHost}:${this.settings.proxyPort}/`);
    }
    this.sock.on('stream', (buf: string) => {
      this.addTelnetLines(buf);
    });
    this.sock.on('status', (status: string) => {
      this.setStatus(status);
      switch (status) {
        case CONN_STATUS_CODE.CONN_REFUSED:
          this.addEchoLine("MUD server refused connection.", 'error error--connection');
          break;
        case CONN_STATUS_CODE.CONN_TELNET_ERR:
          this.addEchoLine("MUD server connection unsuccesfull.", 'error error--connection');
          break;
        case CONN_STATUS_CODE.CONN_PROXY_ERR:
          this.addEchoLine("Websocket proxy connection error.", 'error error--connection');
          break;
        case CONN_STATUS_CODE.CONN_CLOSED:
          this.addEchoLine("Telnet connection was closed.", 'error error--connection');
          this.resetConnection();
          break;
        case CONN_STATUS_CODE.CONN_CONTROL_MASKCHAR:
          this.maskEcho = true;
          break;
        case CONN_STATUS_CODE.CONN_CONTROL_UNMASKCHAR:
          this.maskEcho = false;
          break;
      }
    });
    this.sock.on('connected', () => {
      this.resetConnection();
      this.setConnected(true);
    });
    this.sock.on('disconnect', () => {
      this.setConnected(false);
    });
    this.setKeepAlive(this.settings.keepAlive);
  }

  @action addTelnetLines = (source: string) => {
    let sourceLines = source.replace(/\r/g, '').split('\n');
    sourceLines.forEach((sourceLine) => {
      this.console.push(this.addTelnetLine(sourceLine));
    });
  }

  @action addEchoLine = (line: string, type: string = 'echo') => {
    this.console.push(this.addTelnetLine(line || ' ', type));
  }

  @action resetConnection = () => {
    this.maskEcho = false;
  }

  @action setConnected = (isConnected: boolean) => {
    this.connected = isConnected;
  }

  @action setStatus = (status: string) => {
    this.status = status;
  }

  @action sendCmd = (cmd: string) => {
    if (!this.sock) {
      return;
    }

    const sanitizedCmd = this.sanitizeCommand(cmd);

    // splitting command by ;
    // unless ; is first character
    let commands = [];
    if (cmd.length > 1) {
      const firstLetter = sanitizedCmd.substr(0,1);
      commands = sanitizedCmd.substr(1).split(';');
      commands[0] = firstLetter + commands[0];
    } else {
      commands.push(sanitizedCmd);
    }

    commands.forEach((command) => {
      if (!this.sock) { return; }
      this.sock.emit('stream', command + '\n');
      if (this.settings.echo) {
        const echo = this.maskEcho ? cmd.split('').fill('*').join('') : command;
        this.addEchoLine(echo + '\n');
      }
    });

    this.setKeepAlive(this.settings.keepAlive);
  }

  @action setKeepAlive = (isEnabled: boolean) => {
    this.settings.keepAlive = isEnabled;
    if (isEnabled) {
      if (this.keepAliveTimer) {
        window.clearInterval(this.keepAliveTimer);
      }
      this.keepAliveTimer = window.setInterval(this.sendKeepAlive, 10000);
    }
  }

  @action addTelnetLine = (source: string, type: string = 'block'): ConsoleLine => {
    this.consoleCount++;
    return {
      raw: source,
      text: stripAnsi(source),
      formatted: <Ansi key={this.consoleCount} className={type} text={source} />,
    };
  }

  sanitizeCommand = (cmd: string): string => {
    return he.decode(cmd.trim().replace(/\s+/g, ' '));
  }

  sendKeepAlive = () => {
    if (this.connected) {
      this.sendCmd('');
    }
  }
}

export default Connection;
