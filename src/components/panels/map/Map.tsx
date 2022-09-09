import React, { createRef, RefObject, useEffect, useRef } from 'react';
import { CRS, LatLngBoundsExpression, Map } from 'leaflet';
import { observer } from 'mobx-react';
import { useStore } from '../../../store';
import { renderMapToleaflet } from './renderer/main';

import './Map.css';
import 'leaflet/dist/leaflet.css';

type Props = {}

const MudMap = observer((props: Props) => {
  let map = useRef<Map | null>(null);
  const mapRef: RefObject<HTMLDivElement> = createRef();
  const store = useStore();
  const { game } = store;
  const { map: mapData, areas, selectedArea, selectArea } = game;

  useEffect(() => {
    if (!map.current && mapRef.current) {
      map.current = new Map(mapRef.current, {
        crs: CRS.Simple,
        preferCanvas: true,
        zoomSnap: 0.1,
        center: [-50,-50],
        zoom: 1.5,
        minZoom: 1.5,
      });
      const bounds: LatLngBoundsExpression = [[0,0], [10000,10000]];
      map.current.fitBounds(bounds);
      map.current.panTo([0, 0]);
    }
  }, [ mapRef, map ]);

  useEffect(() => {
    if (map.current && selectedArea !== null && mapData && mapData.areas[selectedArea]) {
      renderMapToleaflet(map.current, mapData.areas[selectedArea]);
    }
  }, [ mapData, selectedArea ])

  return <div id="mapContainer">
    <div id="areas">
    {areas.map((area) => (
      <button
        className={area.idx === selectedArea ? 'selected' : ''}
        onClick={() => selectArea(area.idx)}
      >{area.name}</button>
    ))}
    </div>
    <div id="map" ref={mapRef} />
  </div>
});

export default MudMap;
