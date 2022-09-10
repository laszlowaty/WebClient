import { makeObservable, observable, action } from "mobx";
import { MapData, MapExit } from "./types";

class Game {
  map: MapData | null = null;
  areas: { idx: number, name: string }[] = [];
  selectedArea: number|null = null;

  constructor() {
    makeObservable(this, {
      map: observable,
      areas: observable,
      selectedArea: observable,
      fetchMap: action,
      loadMap: action,
      selectArea: action,
    });
    this.fetchMap();
  }

  fetchMap = () => {
    import('../assets/map.json')
      .then((module) => {
          this.loadMap(this.parseMudletMap(module.default as MapData));
      });
  }

  loadMap = (map: MapData) => {
    this.map = map;
  }

  selectArea = (areaName: number) => {
    this.selectedArea = areaName;
  }

  parseMudletMap = (map: MapData): MapData => {
    // some data juggling around user data from mudlet maps
    // we store JSON values in there, and want to parse them back to objects
    const foundAreas: { idx: number, name: string }[] = [];
    map.areas.forEach(
      (area, areaIdx) => {
        foundAreas.push({ idx: area.id, name: area.name });
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
                if (room.exits) {
                    room.exits.forEach(
                        (e: MapExit) => {
                            // @ts-ignore
                            map.areas[areaIdx].rooms[roomIdx].exits.push(e);
                        }
                    )
                }
          }
        )
      }
    );
    this.areas = foundAreas;
    return map;
  } 
}

export default Game;
