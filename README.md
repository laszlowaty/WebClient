
MUD Web Client used on http://www.killer-mud.pl/

If you are a MUD developer/admin, you can grab a copy of this repo and follow the steps below your own copy of a Web Client that players can use to connect to your game.

# Usage

## Proxy

The web browser itself cannot talk over telnet, so this project provides a simple passthru proxy that has to run on some server (preferably the same server that hosts the game, for better latency).

Follow [this readme file](https://github.com/KillerMUD-pl/WebClient/tree/master/src/proxy#readme) to install the proxy component.

## Web Client

### Method 1: Using prepared build files

Go to [latest release page](https://github.com/KillerMUD-pl/WebClient/releases/tag/v0.1.0), and grab the `web-client.zip` file
Copy the files from the zip file to folder on a web server.

The `index.html` file takes parameters of:
- `host` - the hostname where the proxy is located
- `port` - (optional) the port of the proxy, default: 8080
- `proto` - (optional) the protocol to use, default: https, possible: http, https

Example steps to implement:
- unzip the webclient.zip to a folder in webserver, for example: `http://www.my-awesome-game.net/client`
- open the `http://my-awesome-mud.net/client/index.html?host=mud.my-awesome.net`
- this will open a Web Client that will try to connect to a proxy running on `mud.my-awesome.net`, on port 8080, using HTTPS protocol

### Method 2: Compile your own copy of Web Client

Edit settings in the `/src/store/Connection.tsx`:

```
  settings: ConnSettings = {
    echo: true,
    keepAlive: true,
    proxyProtocol: 'https',     // use 'http' or 'https'
    proxyHost: 'killer-mud.pl', // enter the proxy hostname here
    proxyPort: '8080',          // enter the proxy port here
  };
```

Install node.js on your computer (https://nodejs.org/en/download/), then run these commands in node.js shell, inside the project folder:
```
npm install
npm run build
```

The compiled web client will be placed in the "build" folder.
