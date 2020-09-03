import React from 'react';
import io from 'socket.io-client';
import he from 'he';
import Ansi from '../components/common/Ansi';
import stripAnsi from 'strip-ansi';

import { observable, action } from 'mobx';
import { ConsoleLine, ConnSettings, Capture, CaptureResponse } from './types';
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

  captures: Array<Capture> = [
    {
      request: {
        command: 'inv',
        startTrigger: /Nosisz przy sobie:/,
        cancelTrigger: /testtest/,
        callback: (test: CaptureResponse) => console.log(test),
      },
      response: {
        hadScrollMsg: false,
        lines: [],
      }
    }
  ];
  captureTo: number | null = null;

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

  @action addTelnetLine = (source: string) => {
    const line = this.checkIfShouldCapture(this.parseTelnetLine(source));
    this.console.push(line);
  }

  @action addEchoLine = (line: string, type: string = 'echo') => {
    this.console.push(this.parseTelnetLine(line || ' ', type));
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
      this.addEchoLine(echo);
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

  parseTelnetLine = (source: string, type: string = 'block'): ConsoleLine => {
    this.consoleCount++;
    return {
      raw: source,
      text: stripAnsi(source),
      formatted: (
        <div key={this.consoleCount}>
          <Ansi className={type} text={source} />
        </div>
      ),
    };
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

  checkIfShouldCapture = (line: ConsoleLine): ConsoleLine => {
    // sanity check capture target exists
    if (this.captureTo !== null && !this.captures.length) {
      this.captureTo = null;
    }

    // checking if capturing should start
    if (this.captureTo === null) {
      // find the first capture that matches
      // delete previous ones (in case of capture miss, the non-matched captures from the past are deleted)
      // leave all the rest in the queue
      let parsedCaptures: Array<Capture> = [];
      this.captures.forEach((capture, i) => {
        if (this.captureTo === null && capture.request.startTrigger.test(line.raw)) {
          parsedCaptures = [ capture ];
          this.captureTo = i;
        } else {
          parsedCaptures.push(capture);
        }
      });
      this.captures = parsedCaptures;
    }

    // if capturing is going on
    if (this.captureTo !== null) {
      const capture = this.captures[this.captureTo];
      const pressEnterTest = line.raw.trim().match(/([\s\S]*)\[Naci.nij Enter aby kontynuowa.\]/);
      console.log('capturing', line.raw);
      if (pressEnterTest) {
        capture.response.lines.push(this.parseTelnetLine(pressEnterTest[1]));
        console.log(capture.response);
        this.sendCmd('');
      } else {
        capture.response.lines.push(line);
        console.log(capture.response);
      }
    }

    return line;
  }
}

export default Connection;
