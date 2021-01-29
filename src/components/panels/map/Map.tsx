import React, { Component } from 'react';
import { Map, View } from 'ol';
import { observer } from 'mobx-react';

import 'ol/ol.css';
import './Map.css';

type Props = {}

class MudMap extends Component<Props> {
  map: Map | null;

  constructor(props: Props) {
    super(props);
    this.map = null;
  }
  componentDidMount() {
    console.log('initialize map');
    this.map = new Map({
      view: new View({
        center: [0, 0],
        zoom: 1
      }),
      layers: [
      ],
      target: 'map'
    });
  }
  render() {
    console.log('drawing map');
    return (
      <div id="map"></div>
    )
  }
}

export default observer(MudMap);
