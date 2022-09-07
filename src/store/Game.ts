import { makeObservable, observable, action } from "mobx";
import { MapData } from "./types";

class Game {
  map: MapData | null = null;

  constructor() {
    makeObservable(this, {
      map: observable,
      fetchMap: action,
      loadMap: action,
    });
    this.fetchMap();
  }

  fetchMap = () => {
    // import('../common/data/map/world.json')
    //     .then((module) => {
    //         this.loadMap(this.parseMap(module.default as MapData));
    //     });
  }

  loadMap = (map: MapData) => {
    this.map = map;
  }

  parseMudletMap = (map: MapData): MapData => {
    // some data juggling around user data from mudlet maps
    // we store JSON values in there, and want to parse them back to objects
    map.areas.forEach(
      (area, areaIdx) => {
        area.rooms.forEach(
          (room, roomIdx) => {
            if (room.userData) {
              Object.keys(room.userData).forEach(
                (userDataKey: string) => {
                  // @ts-ignore
                  const line = map.areas[areaIdx]?.rooms[roomIdx]?.userData[userDataKey];
                  switch (userDataKey) {
                    case 'vnum':
                      // @ts-ignore
                      if (map.areas[areaIdx]?.rooms[roomIdx]?.userData[userDataKey]) {
                        // @ts-ignore
                        map.areas[areaIdx].rooms[roomIdx].userData[userDataKey] = parseInt(line);
                      };
                      break;
                    case 'sector':
                      break;
                    default:
                      try {
                        // @ts-ignore
                        if (map.areas[areaIdx]?.rooms[roomIdx]?.userData[userDataKey]) {
                          // @ts-ignore
                          map.areas[areaIdx].rooms[roomIdx].userData[userDataKey] = JSON.parse(line);
                        }
                      } catch (e) {
                      }
                      break;
                    }
                }
              )
            }
          }
        )
      }
    );
    return map;
  } 
}

export default Game;
