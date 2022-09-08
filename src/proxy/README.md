This is a standalone node.js app that proxies Web Client to Telnet.

## Usage

- Grab all the files in this folder, and put them somewhere on a Linux/Unix server that has node.js installed.

- Open the `index.js` and edit the "conf" property.

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

- Save the file and run this in the folder where you located proxy files:
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

> NOTE: This version of proxy only runs the HTTP websocket connection. So when connecting the Web Client to it, you must instruct it to use the "http" protocol (using the "proto" parameter described in Web Client's readme file). If you want to run it using HTTPS, you can follow steps below.

### Using HTTPS with this proxy

- You need to have public and private SSL keys that are valid (**not** self generated). You can get these keys for free from Let's Encrypt. A nice guide is [here](https://www.digitalocean.com/community/tutorials/how-to-use-certbot-standalone-mode-to-retrieve-let-s-encrypt-ssl-certificates-on-ubuntu-20-04).
- There is two blocks of code in the `index.js` file where you need to follow instructions to comment/uncomment blocks of code. One is near the top of the file, and one near the bottom.
- Start (or restart, if it is running) the proxy
- You can now use the "https" value for "proto" in the client (or just remove the "proto" parameter, because "https" is the default setting)

