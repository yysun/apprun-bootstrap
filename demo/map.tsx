import app, { Component } from 'apprun';
import { Card } from '../src/bootstrap';
declare const d3, topojson;

const map = (element, features) => {
  if (!element || !features || !features.length) return;

  const sphere = { type: 'Sphere' };
  const width = element.clientWidth;
  const height = width / 2;

  const projection = d3.geo
    .naturalEarth()
    .scale(width / 6)
    .rotate([180, 0])
    .translate([width / 2, height / 2])
    .precision(0.5);

  const path = d3.geo.path().projection(projection);

  const svg = d3
    .select(element)
    .attr('width', width)
    .attr('height', height);

  svg
    .append('path')
    .attr('class', 'background')
    .attr('d', path(sphere));

  svg
    .append('g')
    .attr('id', 'states')
    .selectAll('path')
    .data(features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('id', function(d) {
      return d.id;
    })
    .on('click', function() {
      d3.select('#map-text').text('D3 Map - Country Code:' + this.id);
    });
};

export default class extends Component {
  state = {};

  view = state =>
    state.map_card || (
      <Card header={<div id="map-text">D3 Map</div>} ref={el => (state.map_card = el)}>
        <svg ref={el => map(el, state.features)}></svg>
      </Card>
    );

  mounted = async (_, __, state) => {
    if (!state.features) {
      state.features = await new Promise((resolve, reject) => {
        d3.json('./world-110m.json', (error, topo) => {
          if (error) throw reject(error);
          const features = topojson.feature(topo, topo.objects.countries)
            .features;
          resolve(features);
        });
      });
    }
    return state;
  };
}
