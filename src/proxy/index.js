#!/usr/bin/env node

const express = require('express');
const open = require('open');
const socketIo = require('socket.io');
const Proxy = require('./Proxy.js');
const fs = require('fs');
const path = require('path');

const app = express();
const server = app.listen(8080, () => {
  if (process.env.NODE_ENV !== 'dev') {
    setTimeout(() => open('http://localhost:8080'), 1000);
  }
});

app.use('/', express.static(__dirname + '/build'));

const conf = {
  telnet: {
    host: 'localhost',
    port: 4000,
  },
  web: {
    port: 8080,
  },
  logTraffic: true,
};

// create socket io
const io = socketIo(server, { cookie: false });
// const io = socketIo.listen(conf.web.port, {
//   cookie: false,
// });

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
