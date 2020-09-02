import React from 'react';
import { observable, action } from 'mobx';

import Connection from "./Connection";
import Game from "./Game";
import App from "./App";

export class Store {
  conn: Connection;
  game: Game;
  app: App;

  @observable connected: boolean = false;

  constructor() {
    this.conn = new Connection();
    this.game = new Game();
    this.app = new App();
    this.init();
  }

  @action init = () => {
  }
}

const StoreContext = React.createContext<Store>(new Store());
export const useStore = () => React.useContext(StoreContext);
