import { Component, Host, h, ComponentInterface, Element, Prop, Event, EventEmitter } from '@stencil/core';
import * as d3 from 'd3';
import leaflet from 'leaflet';

@Component({
  tag: 'app-map-view',
  styleUrl: 'app-map-view.css',
  // shadow: true,
})
export class AppMapView implements ComponentInterface {
  private map: leaflet.Map;
  private heatmapLayerGroup: leaflet.LayerGroup;
  private legendControl: leaflet.Control;
  private textureContainerElement: SVGElement;
  private legendTextureContainerElement: SVGElement;
  private textureUrlDict: { [valueAndBackgroundColor: string]: string } = {};
  private isMouseDrawing: boolean = false;
  private mouseDrawStart: [number, number];
  private mouseDrawEnd: [number, number];
  private mouseDrawRectLayer: leaflet.Layer;
  private datasetRangeIndicatorLayer: leaflet.Layer;

  @Element() hostElement: HTMLAppMapViewElement;

  @Prop() mapTileUrlTemplate = 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
  @Prop() centerPoint: [number, number] = [0, 0];
  @Prop() zoom: number = 1;
  @Prop() datasetRange: {
    minLatitude: number;
    maxLatitude: number;
    minLongitude: number;
    maxLongitude: number;
  };
  @Prop() heatmapData: {
    colorLegendTitle: string;
    colorLegendDefinitions: { value: string; color: string }[];
    textureLegendTitle: string;
    textureLegendDefinitions: { value: string; textureGenerator: any }[];
    primaryValueTitle: string;
    secondaryValueHeader: string;
    isTooltipEnabled: boolean;
    dataPoints: {
      latitude: number;
      longitude: number;
      primaryValue: string | number;
      color: string;
      secondaryValue: string | number;
      textureGenerator: any;
      rectWidth?: number;
      rectHeight?: number;
      radius?: number;
    }[];
  };
  @Prop() heatmapOpacity: number = 0.5;
  @Prop() heatmapHighlightOpacity: number = 0.5;
  @Prop() header: string;
  @Prop() headerTextSize: number = 16;
  @Prop() headerTextColor: string = 'rgb(0,0,0)';
  @Prop() headerTextWeight: string = 'bold';

  @Event() mouseDraw: EventEmitter<{
    minLatitude: number;
    maxLatitude: number;
    minLongitude: number;
    maxLongitude: number;
  }>;

  componentWillRender() {
    this.hostElement.style.setProperty('--heatmap-opacity', this.heatmapOpacity.toString());
    this.hostElement.style.setProperty('--heatmap-highlight-opacity', this.heatmapHighlightOpacity.toString());
  }

  render() {
    return (
      <Host>
        <text
          id="header-text"
          style={{
            fontSize: `${this.headerTextSize}px`,
            color: this.headerTextColor,
            fontWeight: this.headerTextWeight,
          }}
        >
          {this.header}
        </text>
        <div
          id="map-container"
          ref={el => this.updateMap(el)}
          style={{
            height: `calc(100% - ${this.headerTextSize}px)`,
          }}
        ></div>
        <svg id="texture-container" ref={el => (this.textureContainerElement = el)}></svg>
        <svg id="legend-texture-container" ref={el => (this.legendTextureContainerElement = el)}></svg>
      </Host>
    );
  }

  private updateMap(mapContainerElement: HTMLDivElement) {
    if (!this.map) {
      this.map = leaflet.map(mapContainerElement, { center: this.centerPoint, zoom: this.zoom, drawControl: true } as any);
    }
    leaflet.tileLayer(this.mapTileUrlTemplate, { /*attribution: this.mapTileAttribution,*/ subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }).addTo(this.map);

    this.drawDatasetRangeIndicator();
    this.drawHeatmap();
    this.drawLegend();
    this.addMouseDrawEvents();

    setTimeout(() => {
      this.map.invalidateSize();
    });
  }

  private drawDatasetRangeIndicator() {
    if (this.datasetRangeIndicatorLayer) {
      this.map.removeLayer(this.datasetRangeIndicatorLayer);
    }
    if (this.datasetRange) {
      const { minLatitude, maxLatitude, minLongitude, maxLongitude } = this.datasetRange;
      this.datasetRangeIndicatorLayer = leaflet
        .rectangle(
          [
            [minLatitude, minLongitude],
            [maxLatitude, maxLongitude],
          ],
          { color: 'black', fillColor: 'transparent', weight: 1, dashArray: '10, 10' },
        )
        .addTo(this.map);
    }
  }

  private addMouseDrawEvents() {
    this.map.addEventListener('contextmenu', event => (event as any).originalEvent.preventDefault());
    this.map.addEventListener('mousedown', event => {
      if ((event as any).originalEvent.button === 2) {
        this.mouseDrawStart = [(event as any).latlng.lat, (event as any).latlng.lng];
        this.isMouseDrawing = true;
        this.map.dragging.disable();
      }
    });
    this.map.addEventListener('mousemove', event => {
      if (this.isMouseDrawing) {
        this.mouseDrawEnd = [(event as any).latlng.lat, (event as any).latlng.lng];
        const minLatitude = Math.min(this.mouseDrawStart[0], this.mouseDrawEnd[0]);
        const maxLatitude = Math.max(this.mouseDrawStart[0], this.mouseDrawEnd[0]);
        const minLongitude = Math.min(this.mouseDrawStart[1], this.mouseDrawEnd[1]);
        const maxLongitude = Math.max(this.mouseDrawStart[1], this.mouseDrawEnd[1]);

        if (this.mouseDrawRectLayer) {
          this.map.removeLayer(this.mouseDrawRectLayer);
        }
        this.mouseDrawRectLayer = leaflet
          .rectangle(
            [
              [minLatitude, minLongitude],
              [maxLatitude, maxLongitude],
            ],
            { color: 'grey', fillColor: 'transparent', weight: 1 },
          )
          .addTo(this.map);
      }
    });
    this.map.addEventListener('mouseup', event => {
      if ((event as any).originalEvent.button === 2) {
        this.isMouseDrawing = false;
        this.map.dragging.enable();

        const minLatitude = Math.min(this.mouseDrawStart[0], this.mouseDrawEnd[0]);
        const maxLatitude = Math.max(this.mouseDrawStart[0], this.mouseDrawEnd[0]);
        const minLongitude = Math.min(this.mouseDrawStart[1], this.mouseDrawEnd[1]);
        const maxLongitude = Math.max(this.mouseDrawStart[1], this.mouseDrawEnd[1]);

        this.mouseDraw.emit({
          minLatitude,
          maxLatitude,
          minLongitude,
          maxLongitude,
        });
      }
    });
  }

  private drawLegend() {
    if (this.legendControl) {
      this.map.removeControl(this.legendControl);
      this.legendControl = undefined;
    }
    if (this.heatmapData) {
      this.legendControl = (leaflet as any).control({ position: 'bottomleft' });
      this.legendControl.onAdd = () => {
        const div = leaflet.DomUtil.create('div', 'legend');
        div.innerHTML = `<div><h4>${this.heatmapData.colorLegendTitle}</h4>${this.heatmapData.colorLegendDefinitions
          .map(definition => `<i style="background: ${definition.color}"></i><span>${definition.value}</span><br/>`)
          .join('')}</div>`;

        this.legendTextureContainerElement.innerHTML = '';
        div.innerHTML += '<tr/>';
        div.innerHTML += `<div><h4>${this.heatmapData.textureLegendTitle}</h4>${this.heatmapData.textureLegendDefinitions
          .map(definition => {
            const legendTextureSvg = d3.select(this.legendTextureContainerElement);
            const texture = definition.textureGenerator();
            legendTextureSvg.call(texture);
            return `<svg><rect width="100%" height="100%" fill="${texture.url()}"></rect></svg><span>${definition.value}</span><br/>`;
          })
          .join('')}</div>`;

        return div;
      };
      this.legendControl.addTo(this.map);
    }
  }

  private drawHeatmap() {
    const textureSvg = d3.select(this.textureContainerElement);
    if (this.heatmapLayerGroup) {
      this.map.removeLayer(this.heatmapLayerGroup);
      this.heatmapLayerGroup = undefined;
    }
    if (this.heatmapData) {
      this.heatmapLayerGroup = leaflet.layerGroup().addTo(this.map);
      for (const dataPoint of this.heatmapData.dataPoints) {
        const textureDictKey = `${dataPoint.secondaryValue}\t${dataPoint.color}`;
        let textureUrl = this.textureUrlDict[textureDictKey];
        if (!textureUrl) {
          const texture = dataPoint.textureGenerator().background(dataPoint.color);
          textureSvg.call(texture);
          textureUrl = texture.url();
          this.textureUrlDict[textureDictKey] = textureUrl;
        }
        const cellLayer = dataPoint.radius
          ? leaflet.circleMarker([dataPoint.latitude, dataPoint.longitude], { fillColor: textureUrl, radius: dataPoint.radius, className: 'heatmap-cell' })
          : leaflet.rectangle(
              [
                [dataPoint.latitude - dataPoint.rectHeight / 2, dataPoint.longitude - dataPoint.rectWidth / 2],
                [dataPoint.latitude + dataPoint.rectHeight / 2, dataPoint.longitude + dataPoint.rectWidth / 2],
              ],
              { fillColor: textureUrl, className: 'heatmap-cell' },
            );
        if (this.heatmapData.isTooltipEnabled) {
          cellLayer.bindTooltip(
            `Latitude: ${dataPoint.latitude}<br/>` +
              `Longitude: ${dataPoint.longitude}<br/>` +
              `${this.heatmapData.primaryValueTitle}: ${dataPoint.primaryValue}<br/>` +
              `${this.heatmapData.secondaryValueHeader}: ${dataPoint.secondaryValue}`,
          );
        }
        this.heatmapLayerGroup.addLayer(cellLayer);
      }
    }
  }
}
