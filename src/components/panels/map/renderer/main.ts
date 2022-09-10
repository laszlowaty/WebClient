import { Map, Polyline, Rectangle, Util, latLng } from "leaflet";
import { MapArea, MapRoom, MapExit } from "../../../../store/types";

const roomMap: {[vnum: number]: Rectangle} = {};
// Renders the map to leaflet
export const renderMapToleaflet = (map: Map, area: MapArea) => {
    const roomMapIdToRectangle: { [id: number]: Rectangle } = {};
  area.rooms.forEach((room) => {
    const vnum = room.userData?.vnum;
    if (!vnum) {
      getRoom(room).addTo(map);
    } else {
        var rectangle = getRoom(room);
        roomMap[vnum] = rectangle.addTo(map);
        roomMapIdToRectangle[room.id] = rectangle;
    }
  });
    area.rooms.forEach((room) => {
        room.exits.forEach((exit) => {
            var firstRoomVnum = room.userData?.vnum as number;
            var firstRoom = roomMap[firstRoomVnum];
            var secondRoom = roomMapIdToRectangle[exit.exitId];
            if (firstRoom && secondRoom) {
                new Polyline([firstRoom.getCenter(), secondRoom.getCenter()], { color: "black" }).addTo(map);
            }
            })
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