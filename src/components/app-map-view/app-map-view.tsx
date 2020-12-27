import { Component, Host, h, ComponentInterface, Prop } from '@stencil/core';
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

  @Prop() centerPoint: [number, number] = [0, 0];
  @Prop() zoom: number = 1;

  render() {
    return (
      <Host>
        <div
          id="map-container"
          ref={el => this.updateMap(el)}
        ></div>
      </Host>
    );
  }

  private updateMap(mapContainerElement: HTMLDivElement) {
    if (!this.map) {
      this.map = leaflet.map(mapContainerElement, { center: this.centerPoint, zoom: this.zoom });
    }
    leaflet
      .tileLayer(this.mapTileUrlTemplate, { attribution: this.mapTileAttribution })
      .addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize()
    });
  }

}
