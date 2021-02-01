import React from 'react';
import io from 'socket.io-client';
import he from 'he';
import Ansi from '../components/common/Ansi';
import stripAnsi from 'strip-ansi';

import { observable, action } from 'mobx';
import { ConsoleLine, ConnSettings, Capture } from './types';
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
    proxyHost: 'localhost',
    proxyPort: '8080',
  };

  captures: Array<Capture> = [
    // {
    //   request: {
    //     command: 'config',
    //     startTrigger: /Aktualna konfiguracja:/,
    //     cancelTriggers: [
    //       {
    //         pattern: /testtest/,
    //         callback: (line: ConsoleLine) => { console.log('cancel callback', line); },
    //       }
    //     ],
    //     callback: (test: CaptureResponse) => console.log('capture callback', test),
    //   },
    //   response: {
    //     hadScrollMsg: false,
    //     lines: [],
    //   }
    // }
  ];
  captureTo: number | null = null;

  sock: SocketIOClient.Socket | null = null;
  keepAliveTimer: number | null = null;

  constructor() {
    if (this.sock === null) {
      this.sock = io(`http://${this.settings.proxyHost}:${this.settings.proxyPort}/`);
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
      let lines = this.checkIfShouldCapture(this.addTelnetLine(sourceLine));
      lines.forEach((line) => {
        this.console.push(line);
      });
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

  checkIfShouldCapture = (line: ConsoleLine): Array<ConsoleLine> => {
    // Finding out if any capture should be cancelled.
    // For example, if `inventory` command was issued, but you are sleeping, you received "you are asleep", thus
    // capturing should be cancelled.
    // Algorithm:
    // - find the first capture that matches the cancel rule
    // - delete it and previous ones (in case of capture miss, the non-matched captures from the past are deleted)
    // - leave all the rest in the queue
    let newLines: Array<ConsoleLine> = [];
    let cancelCheckedCaptures: Array<Capture> = [];
    let foundCancelled: boolean = false;
    this.captures.forEach((capture, i) => {
      if (foundCancelled) {
        cancelCheckedCaptures.push(capture);
        return;
      }
      capture.request.cancelTriggers.forEach((cancelTrigger) => {
        if (cancelTrigger.pattern.test(line.raw)) {
          foundCancelled = true;
          let newLine = cancelTrigger.callback(line);
          if (newLine) { newLines.push(newLine); }
        }
      });
      if (foundCancelled) {
        cancelCheckedCaptures = [];
      } else {
        cancelCheckedCaptures.push(capture);  
      }
    });

    // updating capture list to remove captures that have been cancelled or outdated
    this.captures = cancelCheckedCaptures;

    // is currentt input block caused capture cancelation, there's no more to do here
    if (foundCancelled) {
      console.log('cancelled some captures', this.captureTo, this.captures);
      return newLines;
    }
  
    // sanity check if capture target exists
    if (this.captureTo !== null && typeof this.captures[this.captureTo] === 'undefined') {
      this.captureTo = null;
    }

    // Checking if capturing should start.
    // Algorithm:
    // - find the first capture that matches start rule
    // - delete previous ones (in case of capture miss, the non-matched captures from the past are deleted)
    // - leave all the rest in the queue
    if (this.captureTo === null) {
      let startCheckedCaptures: Array<Capture> = [];
      this.captures.forEach((capture, i) => {
        if (this.captureTo === null && capture.request.startTrigger.test(line.raw)) {
          startCheckedCaptures = [ capture ];
          this.captureTo = i;
        } else {
          startCheckedCaptures.push(capture);
        }
      });
      // updating captures list because some of they may have become outdated
      this.captures = startCheckedCaptures;
    }

    // sanity check if capture target exists
    if (this.captureTo !== null && typeof this.captures[this.captureTo] === 'undefined') {
      this.captureTo = null;
    }

    // Check if capturing is going on. This happens also for multi-blocks captures, and should be used as little
    // as possible because there is chance of unwanted lines captures between blocks.
    // Multi-block captures mostly happen because of messages like "press enter to see more"
    if (this.captureTo !== null) {
      const capture = this.captures[this.captureTo];
      const pressEnterTest = line.raw.trim().match(this.BLOCK_FOLLOWED_BY_PRESS_ENTER_REGEX);
      console.log('capturing', line.raw);
      if (pressEnterTest) {
        capture.response.lines.push(this.addTelnetLine(pressEnterTest[1]));
        capture.response.hadScrollMsg = true;
        this.sendCmd('');
      } else {
        capture.response.lines.push(line);
        let newLine = capture.request.callback({ ...capture.response });
        if (newLine) { newLines.push(newLine); }
        delete(this.captures[this.captureTo]);
        this.captureTo = null;
      }
      return newLines;
    }

    return [ line ];
  }
}

export default Connection;
