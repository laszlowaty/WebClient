#!/usr/bin/env node

const socketIo = require('socket.io');
const Proxy = require('./Proxy.js');

const conf = {
  telnet: {
    host: 'tunkiewicz.net',
    port: 4000,
  },
  web: {
    port: 8080,
  },
  logTraffic: true,
};

// create socket io
const io = socketIo.listen(conf.web.port, {
  cookie: false,
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
