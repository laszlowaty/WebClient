import { Map, Rectangle } from "leaflet";
import { MapArea, MapRoom } from "../../../../store/types";

const roomMap: {[vnum: number]: Rectangle} = {};

// Renders the map to leaflet
export const renderMapToleaflet = (map: Map, area: MapArea) => {
  area.rooms.forEach((room) => {
    const vnum = room.userData?.vnum;
    if (!vnum) {
      getRoom(room).addTo(map);
    } else {
      roomMap[vnum] = getRoom(room).addTo(map);
    }
  });
}

const getRoom = (room: MapRoom): Rectangle => {
  const x = room.coordinates[0];
  const y = room.coordinates[1];
  return new Rectangle(
    [
      [y, x+0.9],
      [y-0.9, x]
    ],
    {
      fill: true,
      fillColor: '#000',
      fillOpacity: 1,
      weight: 5,
      stroke: false
    }
  )
}
