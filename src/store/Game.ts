import { observable } from "mobx";
import { InventoryItem } from "./types";

class Game {
  @observable inventory = new Array<InventoryItem>();
  @observable map = new Array<string>();
}

export default Game;
