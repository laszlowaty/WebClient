import React from 'react';
import io from 'socket.io-client';
import he from 'he';
import Ansi from '../components/common/Ansi';
import stripAnsi from 'strip-ansi';

import { observable, action } from 'mobx';
import { ConsoleLine, ConnSettings } from './types';
import { CONN_STATUS_CODE } from '../common/system';

class Connection {
  CONSOLE_LIMIT = 1000;
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
    proxyHost: 'localhost',
    proxyPort: '8080',
  };

  sock: SocketIOClient.Socket | null = null;
  keepAliveTimer: number | null = null;

  constructor() {
    if (this.sock === null) {
      this.sock = io(`http://${this.settings.proxyHost}:${this.settings.proxyPort}/`);
    }
    this.sock.on('stream', (buf: string) => {
      this.addTelnetLine(buf);
    });
    this.sock.on('status', (status: string) => {
      this.setStatus(status);
      switch (status) {
        case CONN_STATUS_CODE.CONN_REFUSED:
          this.addLineRaw("MUD server refused connection.", 'error error--connection');
          break;
        case CONN_STATUS_CODE.CONN_TELNET_ERR:
          this.addLineRaw("MUD server connection unsuccesfull.", 'error error--connection');
          break;
        case CONN_STATUS_CODE.CONN_PROXY_ERR:
          this.addLineRaw("Websocket proxy connection error.", 'error error--connection');
          break;
        case CONN_STATUS_CODE.CONN_CLOSED:
          this.addLineRaw("Telnet connection was closed.", 'error error--connection');
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

  @action addTelnetLine = (line: string) => {
    this.consoleCount++;
    this.console.push({
      raw: line,
      text: stripAnsi(line),
      formatted: (
        <div key={this.consoleCount}>
          <Ansi className="block" text={line} />
        </div>
      ),
    });
  }

  @action addEchoLine = (line: string) => {
    this.consoleCount++;
    this.console.push({
      raw: line,
      text: line,
      formatted: (
        <div key={this.consoleCount}>
          <code className="block">{line}</code>
        </div>
      ),
    });
  }

  @action appendEchoToLine = (index: number, text: string, classes?: string) => {
    const old = this.console[index];
    this.consoleCount++;
    const echoText = old.raw.endsWith(' ') ? text : ` ${text}`;
    this.console.push({
      raw: old.raw + echoText,
      text: old.text + echoText,
      formatted: (
        <div key={this.consoleCount}>
          <Ansi className="block" text={old.raw} />
          <code className="echo">{echoText}</code>
        </div>
      ),
    });
    this.console[index] = {
      raw: '',
      text: '',
      formatted: null,
    };
  }

  @action addLineRaw = (line: string, classes?: string) => {
    this.consoleCount++;
    this.console.push({
      raw: line,
      text: line,
      formatted: (
        <div key={this.consoleCount}>
          <span className={classes}>{line}</span>
        </div>
      ),
    });
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
    this.sock.emit('stream', this.sanitizeCommand(cmd) + '\n');
    if (this.settings.echo) {
      const echo = this.maskEcho ? cmd.split('').fill('*').join('') : cmd;
      // if last line container newline, put echo in new line, otherwise append
      if (!this.console[this.console.length - 1].raw.match('[\n\r]$')) {
        this.appendEchoToLine(this.console.length - 1, echo);
      } else {
        this.addEchoLine(echo);
      }
    }
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

  sanitizeCommand = (cmd: string): string => {
    return he.decode(cmd.trim().replace(/\s+/g, ' '));
  }

  sendKeepAlive = () => {
    if (this.connected) {
      debugger;
      this.sendCmd('');
    }
  }
}

export default Connection;
