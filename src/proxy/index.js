#!/usr/bin/env node

const express = require('express');
const open = require('open');
const socketIo = require('socket.io');
const Proxy = require('./Proxy.js');

const app = express();
const server = app.listen(8080, () => {
  if (process.env.NODE_ENV !== 'dev') {
    setTimeout(() => open('http://localhost:8080'), 1000);
  }
});

app.use('/', express.static(__dirname + '/build'));

const conf = {
  telnet: {
    host: 'killermud.pl',
    port: 3000,
  },
  web: {
    port: 8080,
  },
  logTraffic: true,
};

// create socket io
const io = socketIo(server, {
  cookie: false,
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
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
if(conf.logTraffic) proxy.setLogTraffic(true);
