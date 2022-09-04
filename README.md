
MUD Web Client for http://www.killer-mud.pl/

To run with your game:

Edit settings in the `/src/store/Connection.tsx`

```
  @observable settings: ConnSettings = {
    echo: true,
    keepAlive: true,
    proxyProtocol: 'https',
    proxyHost: 'killer-mud.pl',
    proxyPort: '8080',
  };
  ```

Change the "proxy" config to your proxy address and port.
The proxy app that needs to run on your server is in `/src/proxy`, refer to its README.md file.

Once the config is edited, you need to build the app. 

Install node.js on your computer (https://nodejs.org/en/download/), then run these commands in node.js shell, inside the project folder:
```
npm install
npm run build
```

The compiled web client will be in the "build" folder.

---

Or, if the above is a problem, you can just take the current "build" folder, find the `proxyHost:"killer-mud.pl",proxyPort:"8080"` in one of the JS files and edit it.
