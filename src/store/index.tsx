import React from 'react';
import { makeObservable, observable, action } from 'mobx';

import Connection from "./Connection";
import Game from "./Game";
import App from "./App";

export class Store {
  conn: Connection;
  game: Game;
  app: App;

  connected: boolean = false;

  constructor() {
    makeObservable(this, {
      connected: observable,
      init: action,
    });
    this.conn = new Connection();
    this.game = new Game();
    this.app = new App();
    this.init();
  }

  init = () => {
  }
}

const StoreContext = React.createContext<Store>(new Store());
export const useStore = () => React.useContext(StoreContext);
