import React from 'react';
import { observer } from "mobx-react"

import './Map.css';

type Map = MapLine[];
type MapLine = MapChar[];
type MapChar = {
  type: 'player' | 'road' | 'forest' | 'building' | 'empty' | 'unknown',
  char: string,
  light: boolean,
};

const Map = observer(() => {
  const exampleMap = [
    '     +,,   ',
    '     +,,,, ',
    '     ++++++',
    '     +     ',
    '    ++++   ',
    '   *+*o*   ',
    '   *+***   ',
    '  *++***   ',
  ];
  const parsedMap = exampleMap.map((mapLine: string) => {
    return mapLine.split('').map((mapChar: string) => {
      switch (mapChar) {
        case 'o':
          return { type: 'player', char: mapChar, light: false };
        case ' ':
          return { type: 'empty', char: mapChar, light: false };
        case '+':
          return { type: 'road', char: mapChar, light: false };
        case '*':
          return { type: 'building', char: mapChar, light: false };
        case ',':
          return { type: 'forest', char: mapChar, light: false };
        default:
          return { type: 'unknown' , char: mapChar, light: false};
        }
    })
  });
  return (
    <div className="map"> 
    {
      parsedMap.map((mapLine, i) => (
        <div key={i} className="row">
          {
            mapLine.map((mapTile, j) => <div key={j} className={'room ' + mapTile.type} />)
          }
        </div>
      ))
    }
    </div>
  );
});

export default Map;