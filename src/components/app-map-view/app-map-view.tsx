import { Component, Host, h, ComponentInterface, Prop } from '@stencil/core';
import * as d3 from 'd3';
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
  private heatmapLayerGroup: leaflet.LayerGroup;
  private legendControl: leaflet.Control;
  private textureContainerElement: SVGElement;
  private textureUrlDict: { [valueAndBackgroundColor: string]: string } = {};

  @Prop() centerPoint: [number, number] = [0, 0];
  @Prop() zoom: number = 1;
  @Prop() heatmapData: {
    legendInnerHTML: string,
    primaryValueTitle: string,
    secondaryValueHeader: string,
    dataPoints: {
      latitude: number,
      longitude: number,
      primaryValue: string | number,
      color: string,
      secondaryValue: string | number,
      textureDenerator: any,
      rectWidth: number,
      rectHeight: number
    }[]
  };

  render() {
    return (
      <Host>
        <div
          id="map-container"
          ref={el => this.updateMap(el)}
        ></div>
        <svg
          id="texture-container"
          ref={el => this.textureContainerElement = el}
        ></svg>
      </Host>
    );
  }

  private updateMap(mapContainerElement: HTMLDivElement) {
    if (!this.map) {
      this.map = leaflet.map(mapContainerElement, { center: this.centerPoint, zoom: this.zoom, drawControl: true } as any);
    }
    leaflet
      .tileLayer(this.mapTileUrlTemplate, { attribution: this.mapTileAttribution })
      .addTo(this.map);

    if (this.heatmapData) {
      this.drawHeatmap();
      this.drawLegend();
    }

    setTimeout(() => {
      this.map.invalidateSize()
    });
  }


  private drawLegend() {
    if (this.legendControl) {
      this.map.removeControl(this.legendControl);
    }
    this.legendControl = (leaflet as any).control({ position: "bottomleft" });
    this.legendControl.onAdd = () => {
      const div = leaflet.DomUtil.create('div', 'legend');
      div.innerHTML = this.heatmapData.legendInnerHTML;
      return div;
    };
    this.legendControl.addTo(this.map);
  }

  private drawHeatmap() {
    const textureSvg = d3.select(this.textureContainerElement);
    if (this.heatmapLayerGroup) {
      this.map.removeLayer(this.heatmapLayerGroup);
    }
    this.heatmapLayerGroup = leaflet.layerGroup().addTo(this.map);
    for (const dataPoint of this.heatmapData.dataPoints) {
      const textureDictKey = `${dataPoint.secondaryValue}\t${dataPoint.color}`;
      let textureUrl = this.textureUrlDict[textureDictKey];
      if (!textureUrl) {
        const texture = dataPoint.textureDenerator().background(dataPoint.color);
        textureSvg.call(texture);
        textureUrl = texture.url();
        this.textureUrlDict[textureDictKey] = textureUrl;
      }
      const cellLayer = leaflet
        .rectangle(
          [
            [
              dataPoint.latitude - dataPoint.rectHeight / 2,
              dataPoint.longitude - dataPoint.rectWidth / 2
            ],
            [
              dataPoint.latitude + dataPoint.rectHeight / 2,
              dataPoint.longitude + dataPoint.rectWidth / 2
            ]
          ],
          { color: 'transparent', fillOpacity: .5, fillColor: textureUrl }
        )
        .bindTooltip(
          `Latitude: ${dataPoint.latitude}<br/>` +
          `Longitude: ${dataPoint.longitude}<br/>` +
          `${this.heatmapData.primaryValueTitle}: ${dataPoint.primaryValue}<br/>` +
          `${this.heatmapData.secondaryValueHeader}: ${dataPoint.secondaryValue}`
        );
      this.heatmapLayerGroup.addLayer(cellLayer);
    }
  }

}
