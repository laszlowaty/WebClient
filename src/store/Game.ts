import { observable, action } from "mobx";
import { InventoryItem, MapData } from "./types";

class Game {
  @observable inventory = new Array<InventoryItem>();
  @observable map = new Array<string>();

  constructor() {
    this.fetchMap();
  }

  @action fetchMap = () => {
    import('../common/data/map/arras.json')
        .then((module) => {
            this.loadMap(module.default);
        });
  }

  @action loadMap = (data: MapData) => {

  }
}

export default Game;
