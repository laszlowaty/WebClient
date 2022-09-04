This is a standalone node.js app that proxies WebClient to Telnet.

Open index.js and edit the "conf" property.

```
const conf = {
  telnet: {
    host: 'killer-mud.pl',   // hostname of your MUD
    port: 4004,              // port of your MUD
  },
  web: {
    port: 8080,              // it's best to leave this as 8080, this is the default port number the WebClient will use 
  },
};
```

Save the file and run this in the proxy folder:
```
npm install
sudo npm install -g forever forever-service
sudo forever-service install websocket-proxy --script index.js --start
```

This will install dependencies, add a new system service "websocket-proxy" and run it.

The proxy is now running, and it will auto-start on system restart.

To turn it off:
```
sudo service websocket-proxy stop
```

To turn it back on:
```
sudo service websocket-proxy start
```

The logs are in: `/var/log/websocket-proxy.log`

