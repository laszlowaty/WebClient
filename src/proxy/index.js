#!/usr/bin/env node

const conf = {
  telnet: {
    host: 'mud.barsawia.pl',
    port: 23,
  },
  web: {
    port: 8080,
  },
};

const fs = require('fs');
const express = require('express');
const socketIo = require('socket.io');
const net = require('net');
const iconv = require('iconv-lite');
const http = require('http');

class Proxy {
  constructor(io, port, host) {
    this.io = io;
    this.port = port;
    this.host = host;

    this.sockets = {}; // sid -> socket
    this.socketsCount = 0;
    this.decoder = new TextDecoder('utf-8')
    this.controlCodes = [];

    io.on('connection', (sock) => {
      this.onConnected(sock);
    });

    this.lastTick = Date.now();

    // init tick() timer
    this.tick();
    this.timer = setInterval(() => {
      this.tick();
    }, 1000);
  }

  shutdown() {
    if(this.timer) clearInterval(this.timer);
  }

  tick() {
    this.lastTick = Date.now();
  }

  log(id, str, e = null) {
    const time = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'medium', hour12: false }).format(Date.now());
    if (e) {
      console.log(time + ' - ' + id + ': ' + str, e);
    } else {
      console.log(time + ' - ' + id + ': ' + str);
    }
  }

  onConnected(webSock) {
    this.log(webSock.id, 'proxy connected');
    webSock.emit('status', 'CONN_OK');

    if(!webSock.peerSock) {
      this.connectTelnet(webSock);
    }
    webSock.on('stream', (message) => {
      message = iconv.encode(message, 'cp1250');
      const peerSock = webSock.peerSock;
      if(peerSock) {
        peerSock.write(message);
      } else {
        this.connectTelnet(webSock);
      }
    });
    webSock.on('error', (e) => {
      webSock.emit('status', 'CONN_PROXY_ERR');
      this.log(webSock.id, 'proxy error', e);
    });
    webSock.on('disconnect', () => {
      this.log(webSock.id, 'proxy disconnected');
      this.onDisconnected(webSock);
    });
    this.sockets[webSock.id] = webSock;
    this.socketsCount ++;
  }

  onDisconnected(webSock) {
    const peerSock = webSock.peerSock;
    if(peerSock) {
      webSock.peerSock = null;
      peerSock.peerSock = null;
      peerSock.end();
    }
    delete this.sockets[ webSock.id ];
    this.socketsCount --;
  }

  connectTelnet(webSock) {
    const telnet = net.connect( this.port, this.host, () => {
      this.log(webSock.id, 'telnet connected');
      webSock.emit('status', 'CONN_OK');
    });

    telnet.peerSock = webSock;
    webSock.peerSock = telnet;

    telnet.on('data', (buf) => {
      const peerSock = telnet.peerSock;

      if(peerSock) {
        const filteredBuf = this.parseTelnetControlCodes(buf);

        while (this.controlCodes.length) {
          webSock.emit('status', this.controlCodes.shift());
        }

        let line = iconv.decode(filteredBuf, 'cp1250').replace(/[±¶Ľˇ¦¬]/g, (char) => {
          switch (char) {
            case '±': return 'ą';
            case '¶': return 'ś';
            case 'Ľ': return 'ź';
            case 'ˇ': return 'Ą';
            case '¦': return 'Ś';
            case '¬': return 'Ź';
            default: return '';
          }
        });

        peerSock.emit(
          'stream',
          line
        );
      }
    });
    telnet.on('error', (e) => {
      switch (e.code) {
        case 'ECONNREFUSED':
          webSock.emit('status', 'CONN_REFUSED');
          break;
        default:
          webSock.emit('status', 'CONN_TELNET_ERR');
          break;
      }
      this.log(webSock.id, 'telnet error', e);
    });
    telnet.on('close', () => {
      this.log(webSock.id, 'telnet disconnected');
      webSock.emit('status', 'CONN_CLOSED');
    });
    telnet.on('end', () => {
      const peerSock = telnet.peerSock;
      if(peerSock) {
        peerSock.peerSock = null;
        telnet.peerSock = null;
      }
    });
  }

  parseTelnetControlCodes(buf) {
    let controlCharFound = 0;
    const filteredBuf = buf.filter((code) => {
      if (code === 255) {
        controlCharFound = 255;
        return false;
      }
      if (controlCharFound === 255 && (code === 251 || code === 252)) {
        controlCharFound = code;
        return false;
      }
      if (code === 1 && controlCharFound === 251) {
        this.controlCodes.push('CONN_CONTROL_MASKCHAR');
        controlCharFound = 0;
        return false;
      }
      if (code === 1 && controlCharFound === 252) {
        this.controlCodes.push('CONN_CONTROL_UNMASKCHAR');
        controlCharFound = 0;
        return false;
      }
      if (controlCharFound > 0) {
        controlCharFound = 0;
        return false;
      }
      return true;
    });
    return filteredBuf;
  }
}

// ===================================================

const app = express();

const server = http.createServer(app);

server.listen(conf.web.port, function() {
  console.log('server up and running at %s port', conf.web.port);
});

// create socket io
const io = socketIo(server, {
  cookie: false,
  cors: {
    origin: (origin, callback) => callback(null, origin),
    credentials: true,
    methods: "GET,POST",
  }
});

console.log(
  'webtelnet started, listening on port ' +
  conf.web.port +
  ' and forwarding to ' +
  conf.telnet.host +
  ':' +
  conf.telnet.port +
  '\n'
);

// create proxy and bind to io
const proxy = new Proxy(io, conf.telnet.port, conf.telnet.host);

