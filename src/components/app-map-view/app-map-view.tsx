import { Component, Host, h, ComponentInterface } from '@stencil/core';
import leaflet from 'leaflet';

@Component({
  tag: 'app-map-view',
  styleUrl: 'app-map-view.css',
  // shadow: true,
})
export class AppMapView implements ComponentInterface {

  private readonly mapTileUrlTemplate = 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png';
  private readonly mapTileAttribution =
    '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors' +
    ', Tiles courtesy of <a href="https://geo6.be/">GEO-6</a>';

  private map: leaflet.Map;

  render() {
    return (
      <Host>
        <div
          id="map-container"
          ref={el => this.initializeMap(el)}
        ></div>
      </Host>
    );
  }

  private initializeMap(mapContainerElement: HTMLDivElement) {
    this.map = leaflet.map(mapContainerElement, { center: [0, 0], zoom: 1 });
    leaflet
      .tileLayer(this.mapTileUrlTemplate, { attribution: this.mapTileAttribution })
      .addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize()
    });
  }

}
