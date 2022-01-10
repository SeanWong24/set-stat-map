import { Component, Host, h, ComponentInterface, Element, State, Prop, Watch, Event, EventEmitter } from '@stencil/core';
import { ParallelSetsDataNode, ParallelSetsDataRecord, ParallelSetsOnLoadDetail, ParallelSetsDimensionValueSortingHandler } from './utils';
import * as d3 from 'd3';
import textureGenerator from 'textures';

@Component({
  tag: 's-parallel-sets',
  styleUrl: 's-parallel-sets.css',
  shadow: true,
})
export class SParallelSets implements ComponentInterface {
  private startTime: Date;

  private textureContainerElement: SVGElement;
  private textureDict: { [valueAndBackgroundColor: string]: any } = {};

  private get axisTextFontSize() {
    return this.axisBoxWidth * 0.8;
  }

  private get axisFooterTextActualSize() {
    return this.axisFooter ? this.axisFooterTextSize : 0;
  }

  @Element() hostElement: HTMLElement;

  @Prop() data: ParallelSetsDataRecord[] = [];
  @Prop({ mutable: true }) dimensions: string[];
  @Prop() dimensionDisplyedNameDict: { [dimensionName: string]: string };
  @Prop() dimensionValueSortingMethods: ParallelSetsDimensionValueSortingHandler | { [dimensionName: string]: ParallelSetsDimensionValueSortingHandler };
  @Prop() maxAxisSegmentCount: number | { [dimensionName: string]: number } = 10;
  @Prop() autoMergedAxisSegmentName: string | { [dimensionName: string]: string | number } = '*Other*';
  @Prop() autoMergedAxisSegmentMaxRatio: number = 1;
  @Prop() maxAxisSegmentMarginRatioAllowed: number = 0.1;
  @Prop() colorScheme: string[] = ['#eddcd2', '#fff1e6', '#fde2e4', '#fad2e1', '#c5dedd', '#dbe7e4', '#f0efeb', '#d6e2e9', '#bcd4e6', '#99c1de'];
  @Prop() defineTexturesHandler: (textureGenerator: any) => (() => any)[] = textureGenerator => [
    () => textureGenerator.lines().stroke('transparent'),
    () => textureGenerator.circles().radius(2),
    () => textureGenerator.lines().orientation('2/8').size(10),
    () => textureGenerator.lines().orientation('2/8').size(10).heavier(),
    () => textureGenerator.lines().orientation('8/8').size(10),
    () => textureGenerator.lines().orientation('8/8').size(10).heavier(),
    () => textureGenerator.lines().orientation('6/8').size(10),
    () => textureGenerator.lines().orientation('6/8').size(10).heavier(),
  ];
  @Prop() axisHeaderTextSize: number = 16;
  @Prop() axisHeaderTextColor: string | { [dimensionName: string]: string } = 'rgb(0,0,0)';
  @Prop() axisHeaderTextWeight: string | { [dimensionName: string]: string } = 'bold';
  @Prop() axisHeaderTextMaxLetterCount: number;
  @Prop() axisFooter: string | { [dimensionName: string]: string };
  @Prop() axisFooterTextSize: number = 16;
  @Prop() axisFooterTextColor: string | { [dimensionName: string]: string } = 'rgb(0,0,0)';
  @Prop() axisFooterTextWeight: string | { [dimensionName: string]: string } = 'bold';
  @Prop() axisStrokeWidth: number = 3;
  @Prop() axisBoxWidth: number = 15;
  @Prop() axisBoxFill: string = 'rgb(100,100,100)';
  @Prop() axisSegmentTextColor: string = 'rgb(0,0,0)';
  @Prop() sideMargin: number = 2;
  @Prop() minimumRatioToShowAxisText: number = 0;
  @Prop() ribbonOpacity: number = 0.5;
  @Prop() ribbonHighlightOpacity: number = 0.8;
  @Prop() ribbonDimOpacity: number = 0.2;
  @Prop() ribbonTension: number = 1;

  @State() hostElementBoundingClientRect: DOMRect;

  @Watch('data')
  dataWatchHandler(value: ParallelSetsDataRecord[]) {
    this.dimensions = this.dimensions?.length > 0 ? this.dimensions : Object.keys(value[0] || {});
  }

  @Event() visLoad: EventEmitter<ParallelSetsOnLoadDetail>;
  @Event() axisHeaderClick: EventEmitter<{ dimensionName: string; dataNodes: ParallelSetsDataNode[] }>;
  @Event() axisHeaderContextMenu: EventEmitter<{ dimensionName: string; dataNodes: ParallelSetsDataNode[] }>;
  @Event() axisHeaderMouseOver: EventEmitter<{ dimensionName: string; dataNodes: ParallelSetsDataNode[] }>;
  @Event() axisHeaderMouseOut: EventEmitter<{ dimensionName: string; dataNodes: ParallelSetsDataNode[] }>;
  @Event() axisSegmentClick: EventEmitter<{ dimensionName: string; value: string | number; count: number; proportion: number; dataNodes: ParallelSetsDataNode[] }>;
  @Event() axisSegmentContextMenu: EventEmitter<{ dimensionName: string; value: string | number; count: number; proportion: number; dataNodes: ParallelSetsDataNode[] }>;
  @Event() axisSegmentMouseOver: EventEmitter<{ dimensionName: string; value: string | number; count: number; proportion: number; dataNodes: ParallelSetsDataNode[] }>;
  @Event() axisSegmentMouseOut: EventEmitter<{ dimensionName: string; value: string | number; count: number; proportion: number; dataNodes: ParallelSetsDataNode[] }>;
  @Event() ribbonClick: EventEmitter<{ dimensions: string[]; valueHistory: (string | number)[]; count: number; proportion: number; dataNode: ParallelSetsDataNode }>;
  @Event() ribbonContextMenu: EventEmitter<{ dimensions: string[]; valueHistory: (string | number)[]; count: number; proportion: number; dataNode: ParallelSetsDataNode }>;
  @Event() ribbonMouseOver: EventEmitter<{ dimensions: string[]; valueHistory: (string | number)[]; count: number; proportion: number; dataNode: ParallelSetsDataNode }>;
  @Event() ribbonMouseOut: EventEmitter<{ dimensions: string[]; valueHistory: (string | number)[]; count: number; proportion: number; dataNode: ParallelSetsDataNode }>;

  connectedCallback() {
    const resizeObserver = new ResizeObserver(entryList => {
      for (const entry of entryList) {
        if (entry.target === this.hostElement) {
          this.hostElementBoundingClientRect = entry.target.getBoundingClientRect();
        }
      }
    });
    resizeObserver.observe(this.hostElement);
  }

  componentWillLoad() {
    this.dataWatchHandler(this.data);
  }

  componentWillRender() {
    this.hostElement.style.setProperty('--axis-text-font-size', this.axisTextFontSize + 'px');
    this.hostElement.style.setProperty('--ribbon-highlight-opacity', this.ribbonHighlightOpacity.toString());
    this.hostElement.style.setProperty('--ribbon-dim-opacity', this.ribbonDimOpacity.toString());
    this.startTime = new Date();
  }

  componentDidRender(): void {
    console.log(new Date().getTime() - this.startTime.getTime());
  }

  render() {
    let mainContainer = <div>Loading...</div>;
    if (this.hostElementBoundingClientRect && this.textureContainerElement) {
      if (this.data?.length > 0) {
        const dimensionAndValuesDict = this.generateDimensionAndValuesDict();
        const isDimensionAndValuesDictValid = Object.values(dimensionAndValuesDict).every(values => values?.length > 0 && values[0] !== undefined);
        if (isDimensionAndValuesDictValid) {
          const dimensionAndDataNodesDict = this.generateDimensionAndDataNodesDict(dimensionAndValuesDict);

          const { width, height } = this.hostElementBoundingClientRect || {};
          const colorScale = d3.scaleOrdinal(this.colorScheme);
          const textures = this.defineTexturesHandler ? this.defineTexturesHandler(textureGenerator) : undefined;
          const textureScale = textures ? d3.scaleOrdinal(textures) : undefined;

          mainContainer = (
            <div
              id="main-container"
              ref={() =>
                this.visLoad.emit({
                  data: this.data,
                  dimensions: this.dimensions,
                  valuesDict: dimensionAndValuesDict,
                  dataNodesDict: dimensionAndDataNodesDict,
                  // TODO generate colorDict and textureDict first and then pass it into renderMainSvg
                  colorDict: Object.fromEntries(dimensionAndValuesDict[this.dimensions[0]]?.map(value => [value, colorScale(value.toString())])),
                  textureGeneratorDict: Object.fromEntries(dimensionAndValuesDict[this.dimensions[1]]?.map(value => [value, textureScale(value.toString())])),
                })
              }
            >
              {this.renderAxisHeaders(width, dimensionAndDataNodesDict)}
              {this.renderMainSvg({
                width,
                height,
                colorScale,
                textureScale,
                dimensionAndDataNodesDict,
                dimensionAndValuesDict,
              })}
              {this.axisFooter && this.renderAxisFooters(width)}
            </div>
          );
        } else {
          mainContainer = <div>Dimensions are not valid</div>;
        }
      } else {
        mainContainer = <div>No data</div>;
      }
    }

    return (
      <Host>
        {mainContainer}
        {this.renderTextureContainer()}
      </Host>
    );
  }

  private renderTextureContainer() {
    return <svg id="texture-container" ref={el => (this.textureContainerElement = el)}></svg>;
  }

  private renderMainSvg(params: {
    width: number;
    height: number;
    colorScale: d3.ScaleOrdinal<string, string, never>;
    textureScale: d3.ScaleOrdinal<string, any, never>;
    dimensionAndDataNodesDict: { [dimensionName: string]: ParallelSetsDataNode[] };
    dimensionAndValuesDict: { [dimensionName: string]: (string | number)[] };
  }) {
    const { width, height, colorScale, textureScale, dimensionAndDataNodesDict, dimensionAndValuesDict } = params;

    const svgHeight = height - this.axisHeaderTextSize - this.axisFooterTextActualSize;
    return (
      <svg id="main-svg" width={width} height={svgHeight}>
        {this.renderRibbons({
          width,
          height: svgHeight,
          colorScale,
          textureScale,
          dimensionAndDataNodesDict,
        })}
        {this.renderAxes({
          width,
          height: svgHeight,
          dimensionAndDataNodesDict,
          dimensionAndValuesDict,
        })}
      </svg>
    );
  }

  private renderRibbons(params: {
    width: number;
    height: number;
    colorScale: d3.ScaleOrdinal<string, string, never>;
    textureScale: d3.ScaleOrdinal<string, any, never>;
    dimensionAndDataNodesDict: { [dimensionName: string]: ParallelSetsDataNode[] };
  }) {
    const { width, height, colorScale, textureScale, dimensionAndDataNodesDict } = params;

    // TODO extract methods
    return (
      <g class="ribbons">
        {this.dimensions.map((dimensionName, dimensionIndex) => {
          const dataNodes = dimensionAndDataNodesDict[dimensionName];
          const nextDimensionName = this.dimensions[dimensionIndex + 1];
          const ribbons = dataNodes.map(dataNode => {
            const x = this.obtainAxisPosition(width, this.sideMargin, dimensionIndex);
            const childX = this.obtainAxisPosition(width, this.sideMargin, dimensionIndex + 1);
            const childDataNodes = (dimensionAndDataNodesDict[nextDimensionName] || [])
              // TODO try to use index calculation for the filter
              .filter(childDataNode => childDataNode.valueHistory.slice(0, dataNode.valueHistory.length).toString() === dataNode.valueHistory.toString());
            let totalPreviousCountRatio = 0;
            return childDataNodes.map(childDataNode => {
              const childCountRatio =
                ((childDataNode.axisSegmentPosition[1] - childDataNode.axisSegmentPosition[0]) *
                  (dataNode.valueHistory[dimensionIndex] === this.autoMergedAxisSegmentName ? 1 - dataNode.autoMergedAxisSegmentAdjustmentRatio : 1)) /
                dataNode.adjustmentRatio;
              const y1 = (dataNode.adjustedAxisSegmentPosition[0] + totalPreviousCountRatio) * height;
              const y2 = (dataNode.adjustedAxisSegmentPosition[0] + (totalPreviousCountRatio += childCountRatio)) * height;
              const childY1 = childDataNode.adjustedAxisSegmentPosition[0] * height;
              const childY2 = childDataNode.adjustedAxisSegmentPosition[1] * height;
              const pathD = this.obtainRibbonPathD({
                x,
                y1,
                y2,
                childX,
                childY1,
                childY2,
              });
              const backgroundColor = colorScale(dataNode.valueHistory[0].toString());
              let texture;
              if (textureScale && dataNode.valueHistory[1] !== undefined) {
                const textureDictKey = `${dataNode.valueHistory[1]}\t${backgroundColor}`;
                texture = this.textureDict[textureDictKey];
                if (!texture) {
                  texture = textureScale(dataNode.valueHistory[1].toString())().background(backgroundColor);
                  this.textureDict[textureDictKey] = texture;
                }
                d3.select(this.textureContainerElement).call(texture);
              }

              const valueHistory = childDataNode.valueHistory;
              const dataRecordCount = childDataNode.dataRecords.length;
              const proportion = childDataNode.dataRecords.length / this.data.length;

              const eventData = {
                dimensions: [dimensionName, nextDimensionName],
                valueHistory,
                count: dataRecordCount,
                proportion,
                dataNode,
              };
              const path = (
                <path
                  class="ribbon"
                  ref={el => d3.select(el).datum(childDataNode)}
                  d={pathD}
                  fill={texture ? texture.url() : backgroundColor}
                  opacity={this.ribbonOpacity}
                  onMouseEnter={() => {
                    const ribbons = d3.select(this.hostElement.shadowRoot).selectAll('.ribbon');
                    ribbons.classed('dim', true);
                    const highlightedRibbons = ribbons.filter((node: ParallelSetsDataNode) => {
                      const minValueHistoryLenght = d3.min([node.valueHistory.length, childDataNode.valueHistory.length]);
                      if (node.valueHistory.slice(0, minValueHistoryLenght).toString() === childDataNode.valueHistory.slice(0, minValueHistoryLenght).toString()) {
                        return true;
                      } else {
                        return false;
                      }
                    });
                    highlightedRibbons.classed('dim', false).classed('hightlight', true);
                  }}
                  onMouseLeave={() => {
                    d3.select(this.hostElement.shadowRoot).selectAll('.ribbon').classed('dim', false).classed('highlight', false);
                  }}
                  onClick={() => this.ribbonClick.emit(eventData)}
                  onContextMenu={event => {
                    event.preventDefault();
                    this.ribbonContextMenu.emit(eventData);
                  }}
                  onMouseOver={() => this.ribbonMouseOver.emit(eventData)}
                  onMouseOut={() => this.ribbonMouseOut.emit(eventData)}
                >
                  <title>
                    {`Dimension: ${dimensionName} -> ${nextDimensionName}\n` +
                      `Value History: ${valueHistory.join(' -> ')}\n` +
                      `Count: ${dataRecordCount}\n` +
                      `Proportion: ${(proportion * 100).toFixed(2)}%`}
                  </title>
                </path>
              );
              return path;
            });
          });
          return <g class="ribbon-group">{ribbons.flat()}</g>;
        })}
      </g>
    );
  }

  private obtainRibbonPathD(params: { x: number; y1: number; y2: number; childX: number; childY1: number; childY2: number }) {
    const { x, y1, y2, childX, childY1, childY2 } = params;

    const controlPointX1 = this.ribbonTension * x + (1 - this.ribbonTension) * childX;
    const controlPointX2 = this.ribbonTension * childX + (1 - this.ribbonTension) * x;
    const pathGenerator = d3.path();
    pathGenerator.moveTo(x, y1);
    pathGenerator.lineTo(x, y2);
    pathGenerator.bezierCurveTo(controlPointX1, y2, controlPointX2, childY2, childX, childY2);
    pathGenerator.lineTo(childX, childY1);
    pathGenerator.bezierCurveTo(controlPointX2, childY1, controlPointX1, y1, x, y1);
    pathGenerator.closePath();
    const pathD = pathGenerator.toString();
    return pathD;
  }

  private renderAxes(params: {
    width: number;
    height: number;
    dimensionAndDataNodesDict: { [dimensionName: string]: ParallelSetsDataNode[] };
    dimensionAndValuesDict: { [dimensionName: string]: (string | number)[] };
  }) {
    const { width, height, dimensionAndDataNodesDict } = params;
    return (
      <g class="axes">
        {this.dimensions.map((dimensionName, dimensionIndex) => {
          const currentSegmentValueAndDataNodesDict = this.obtainCurrentSegmentValueAndDataNodesDict(dimensionAndDataNodesDict, dimensionName, dimensionIndex);
          const currentSegmentElemens = Object.entries(currentSegmentValueAndDataNodesDict).map(([currentSegmentValue, currentSegmentDataNodes]) =>
            this.renderAxisSegment(width, dimensionIndex, currentSegmentDataNodes, height, dimensionName, currentSegmentValue),
          );
          return <g class="axis">{currentSegmentElemens}</g>;
        })}
      </g>
    );
  }

  private obtainCurrentSegmentValueAndDataNodesDict(dimensionAndDataNodesDict: { [dimensionName: string]: ParallelSetsDataNode[] }, dimensionName: string, dimensionIndex: number) {
    const dataNodes = dimensionAndDataNodesDict[dimensionName];
    const currentSegmentValueAndDataNodesDict: { [value: string]: ParallelSetsDataNode[] } = {};
    for (const dataNode of dataNodes) {
      const currentSegmentDataNodes = currentSegmentValueAndDataNodesDict[dataNode.valueHistory[dimensionIndex].toString()];
      if (currentSegmentDataNodes) {
        currentSegmentDataNodes.push(dataNode);
      } else {
        currentSegmentValueAndDataNodesDict[dataNode.valueHistory[dimensionIndex].toString()] = [dataNode];
      }
    }
    return currentSegmentValueAndDataNodesDict;
  }

  private renderAxisSegment(
    width: number,
    dimensionIndex: number,
    currentSegmentDataNodes: ParallelSetsDataNode[],
    height: number,
    dimensionName: string,
    currentSegmentValue: string,
  ) {
    const x = this.obtainAxisPosition(width, this.sideMargin, dimensionIndex);
    const currentSegmentPosition = [
      currentSegmentDataNodes[0].adjustedAxisSegmentPosition[0],
      currentSegmentDataNodes[currentSegmentDataNodes.length - 1].adjustedAxisSegmentPosition[1],
    ];
    return (
      <g class="axis-segment">
        {this.renderAxisSegmentLine({
          x,
          height,
          currentSegmentPosition,
        })}
        {this.renderAxisSegmentBox({
          x,
          currentSegmentPosition,
          height,
          dimensionName,
          currentSegmentValue,
          currentSegmentDataNodes,
        })}
        {this.renderAxisSegmentText({
          x,
          height,
          currentSegmentPosition,
          currentSegmentValue,
        })}
      </g>
    );
  }

  private renderAxisSegmentText(params: { x: number; height: number; currentSegmentPosition: number[]; currentSegmentValue: string }) {
    const { x, height, currentSegmentPosition, currentSegmentValue } = params;

    const maxTextHeight = (currentSegmentPosition[1] - currentSegmentPosition[0]) * height;
    const maxCharactorCount = Math.floor(maxTextHeight / this.axisTextFontSize) * 2;
    return (
      <text class="axis-segment-text" x={x + this.axisBoxWidth / 2} y={currentSegmentPosition[0] * height} text-anchor="start" writing-mode="tb" fill={this.axisSegmentTextColor}>
        {currentSegmentPosition[1] - currentSegmentPosition[0] >= this.minimumRatioToShowAxisText ? currentSegmentValue.substring(0, maxCharactorCount) : ''}
      </text>
    );
  }

  private renderAxisSegmentBox(params: {
    x: number;
    currentSegmentPosition: number[];
    height: number;
    dimensionName: string;
    currentSegmentValue: string;
    currentSegmentDataNodes: ParallelSetsDataNode[];
  }) {
    const { x, currentSegmentPosition, height, dimensionName, currentSegmentValue, currentSegmentDataNodes } = params;

    const dataRecordCount = d3.sum(currentSegmentDataNodes.map(d => d.dataRecords.length));
    const proportion = d3.sum(currentSegmentDataNodes.map(d => d.axisSegmentPosition[1] - d.axisSegmentPosition[0])) / (1 - this.maxAxisSegmentMarginRatioAllowed);
    const eventData = {
      dimensionName,
      value: currentSegmentValue,
      count: dataRecordCount,
      proportion,
      dataNodes: currentSegmentDataNodes,
    };

    return (
      <rect
        class="axis-segment-box"
        x={x}
        y={currentSegmentPosition[0] * height}
        width={this.axisBoxWidth}
        height={(currentSegmentPosition[1] - currentSegmentPosition[0]) * height}
        fill={this.axisBoxFill}
        onClick={() => this.axisSegmentClick.emit(eventData)}
        onContextMenu={event => {
          event.preventDefault();
          this.axisSegmentContextMenu.emit(eventData);
        }}
        onMouseEnter={() => {
          const ribbons = d3.select(this.hostElement.shadowRoot).selectAll('.ribbon');
          const dimensionIndex = this.dimensions.indexOf(dimensionName);
          const highlightedRibbons = ribbons.filter((d: ParallelSetsDataNode) => d.valueHistory[dimensionIndex]?.toString() === currentSegmentValue.toString());
          const highlightedRibbonsValueHistories = highlightedRibbons.data().map((d: ParallelSetsDataNode) => d.valueHistory);
          const allHighlightedRibbons = ribbons.filter((node: ParallelSetsDataNode) => {
            if (highlightedRibbonsValueHistories.find(d => d.slice(0, node.valueHistory.length).toString() === node.valueHistory.slice(0, node.valueHistory.length).toString())) {
              return true;
            } else {
              return false;
            }
          });
          ribbons.classed('dim', true);
          allHighlightedRibbons.classed('dim', false).classed('highlight', true);
        }}
        onMouseLeave={() => {
          d3.select(this.hostElement.shadowRoot).selectAll('.ribbon').classed('dim', false).classed('highlight', false);
        }}
        onMouseOver={() => this.axisSegmentMouseOver.emit(eventData)}
        onMouseOut={() => this.axisSegmentMouseOut.emit(eventData)}
      >
        <title>
          {`Dimension: ${dimensionName}\n` + `Value: ${currentSegmentValue.toString()}\n` + `Count: ${dataRecordCount}\n` + `Proportion: ${(proportion * 100).toFixed(2)}%`}
        </title>
      </rect>
    );
  }

  private renderAxisSegmentLine(params: { x: number; height: number; currentSegmentPosition: number[] }) {
    const { x, height, currentSegmentPosition } = params;

    return (
      <line
        class="axis-segment-line"
        x1={x}
        y1={currentSegmentPosition[0] * height}
        x2={x}
        y2={currentSegmentPosition[1] * height}
        stroke="black"
        stroke-width={this.axisStrokeWidth}
      ></line>
    );
  }

  private renderAxisHeaders(width: number, dimensionAndDataNodesDict: { [dimensionName: string]: ParallelSetsDataNode[] }) {
    return (
      <div id="axis-headers-container" style={{ height: this.axisHeaderTextSize + 'px' }}>
        {this.dimensions.map((dimensionName, dimensionIndex) => {
          const eventData = {
            dimensionName,
            dataNodes: dimensionAndDataNodesDict[dimensionName],
          };

          const color = this.axisHeaderTextColor?.[dimensionName] || this.axisHeaderTextColor?.[''] || this.axisHeaderTextColor;
          const fontWeight = this.axisHeaderTextWeight?.[dimensionName] || this.axisHeaderTextWeight?.[''] || this.axisHeaderTextWeight;

          const displayedDimensionName = this.dimensionDisplyedNameDict?.[dimensionName] || dimensionName;
          return (
            <text
              class="axis-header-text"
              style={{
                position: 'absolute',
                color,
                fontSize: this.axisHeaderTextSize + 'px',
                fontWeight,
                left: this.obtainAxisPosition(width, this.sideMargin, dimensionIndex) + 'px',
                transform: this.obtainAxisHeaderTransform(dimensionIndex),
              }}
              onClick={() => this.axisHeaderClick.emit(eventData)}
              onContextMenu={event => {
                event.preventDefault();
                this.axisHeaderContextMenu.emit(eventData);
              }}
              onMouseOver={() => this.axisHeaderMouseOver.emit(eventData)}
              onMouseOut={() => this.axisHeaderMouseOut.emit(eventData)}
            >
              {displayedDimensionName.substring(0, Number.isNaN(this.axisHeaderTextMaxLetterCount) ? undefined : this.axisHeaderTextMaxLetterCount)}
            </text>
          );
        })}
      </div>
    );
  }

  private renderAxisFooters(width: number) {
    return (
      <div id="axis-footer-container" style={{ height: this.axisFooterTextSize + 'px' }}>
        {this.dimensions.map((dimensionName, dimensionIndex) => {
          const footer = this.axisFooter?.[dimensionName] || this.axisFooter?.[''] || this.axisFooter;
          const color = this.axisFooterTextColor?.[footer] || this.axisFooterTextColor?.[''] || this.axisFooterTextColor;
          const fontWeight = this.axisFooterTextWeight?.[footer] || this.axisFooterTextWeight?.[''] || this.axisFooterTextWeight;
          return (
            <text
              class="axis-footer-text"
              style={{
                position: 'absolute',
                color,
                fontSize: this.axisFooterTextSize + 'px',
                fontWeight,
                left: this.obtainAxisPosition(width, this.sideMargin, dimensionIndex) + 'px',
                transform: this.obtainAxisHeaderTransform(dimensionIndex),
              }}
            >
              {footer}
            </text>
          );
        })}
      </div>
    );
  }

  private obtainAxisHeaderTransform(dimensionIndex: number) {
    let transform = 'translate(-50%)';
    if (dimensionIndex === 0) {
      transform = 'translate(0%)';
    } else if (dimensionIndex === this.dimensions.length - 1) {
      transform = `translate(calc(-100% + ${this.axisBoxWidth}px))`;
    }
    return transform;
  }

  private generateDimensionAndDataNodesDict(dimensionAndValuesDict: { [dimensionName: string]: (string | number)[] }) {
    const dimensionAndDataNodesDict = this.initializeDimensionAndDataNodeDict(dimensionAndValuesDict);
    this.fillDataRecordsIntoDimensionAndDataNodeDict(dimensionAndDataNodesDict, dimensionAndValuesDict);
    this.removeEmptyDataNodesForDimensionAndDataNodeDict(dimensionAndDataNodesDict);
    this.fillSegmentPositionsForDimensionAndDataNodeDict(dimensionAndDataNodesDict, dimensionAndValuesDict);

    return dimensionAndDataNodesDict;
  }

  private fillSegmentPositionsForDimensionAndDataNodeDict(
    dimensionAndDataNodesDict: { [dimensionName: string]: ParallelSetsDataNode[] },
    dimensionAndValuesDict: { [dimensionName: string]: (string | number)[] },
  ) {
    for (let dimensionIndex = 0; dimensionIndex < this.dimensions.length; dimensionIndex++) {
      const dimensionName = this.dimensions[dimensionIndex];
      const dataNodes = dimensionAndDataNodesDict[dimensionName];
      const { autoMergedAxisSegmentAdjustmentOffset, autoMergedAxisSegmentAdjustmentOffsetRatio } =
        this.obtainAutoMergedAxisSegmentAdjustmentOffsetAndAdjustmentOffsetRatioForSingleDimension({
          dimensionAndValuesDict,
          dimensionName,
          dataNodes,
          dimensionIndex,
        });
      this.fillSegmentPositionsForSingleDimension({
        autoMergedAxisSegmentAdjustmentOffset,
        autoMergedAxisSegmentAdjustmentOffsetRatio,
        dimensionIndex,
        dimensionName,
        dataNodes,
        dimensionAndValuesDict,
      });
    }
  }

  private fillSegmentPositionsForSingleDimension(params: {
    autoMergedAxisSegmentAdjustmentOffset: number;
    autoMergedAxisSegmentAdjustmentOffsetRatio: number;
    dimensionIndex: number;
    dimensionName: string;
    dataNodes: ParallelSetsDataNode[];
    dimensionAndValuesDict: { [dimensionName: string]: (string | number)[] };
  }) {
    const { autoMergedAxisSegmentAdjustmentOffset, autoMergedAxisSegmentAdjustmentOffsetRatio, dimensionIndex, dimensionName, dataNodes, dimensionAndValuesDict } = params;
    const adjustedTotalDataRecordCount = this.data.length - autoMergedAxisSegmentAdjustmentOffset;
    let totalMarginRatio = 0;
    for (let dataNodeIndex = 0; dataNodeIndex < dataNodes.length; dataNodeIndex++) {
      const dataNode = dataNodes[dataNodeIndex];
      dataNode.autoMergedAxisSegmentAdjustmentRatio = autoMergedAxisSegmentAdjustmentOffsetRatio;
      dataNode.adjustmentRatio = adjustedTotalDataRecordCount / this.data.length;

      const autoMergedAxisSegmentName = this.obtainAutoMergedAxisSegmentNameForDimension(dimensionName);
      const obtainDataRecordCountAdjustmentRatio = (dataNode: ParallelSetsDataNode) =>
        dataNode.valueHistory[dimensionIndex] === autoMergedAxisSegmentName ? 1 - autoMergedAxisSegmentAdjustmentOffsetRatio : 1;
      const totalPreviousCount = d3.sum(dataNodes.slice(0, dataNodeIndex).map(d => d.dataRecords.length));
      const totalPreviousCountRatio = (totalPreviousCount / this.data.length) * (1 - this.maxAxisSegmentMarginRatioAllowed);
      const totalCurrentCountRatio = ((totalPreviousCount + dataNode.dataRecords.length) / this.data.length) * (1 - this.maxAxisSegmentMarginRatioAllowed);
      const adjustedTotalPreviousCount = d3.sum(dataNodes.slice(0, dataNodeIndex).map(d => d.dataRecords.length * obtainDataRecordCountAdjustmentRatio(d)));
      const adjustedTotalPreviousCountRatio = (adjustedTotalPreviousCount / adjustedTotalDataRecordCount) * (1 - this.maxAxisSegmentMarginRatioAllowed);
      const adjustedTotalCurrentCountRatio =
        ((adjustedTotalPreviousCount + dataNode.dataRecords.length * obtainDataRecordCountAdjustmentRatio(dataNode)) / adjustedTotalDataRecordCount) *
        (1 - this.maxAxisSegmentMarginRatioAllowed);

      const axisSegmentMarginRatio = this.maxAxisSegmentMarginRatioAllowed / dimensionAndValuesDict[dimensionName].length / 2;
      if (dataNodes[dataNodeIndex].valueHistory[dimensionIndex] !== dataNodes[dataNodeIndex - 1]?.valueHistory[dimensionIndex]) {
        totalMarginRatio += axisSegmentMarginRatio;
      }

      if (autoMergedAxisSegmentAdjustmentOffset) {
        dataNode.adjustedAxisSegmentPosition = [adjustedTotalPreviousCountRatio + totalMarginRatio, adjustedTotalCurrentCountRatio + totalMarginRatio];
      }
      dataNode.axisSegmentPosition = [totalPreviousCountRatio + totalMarginRatio, totalCurrentCountRatio + totalMarginRatio];

      if (dataNodes[dataNodeIndex].valueHistory[dimensionIndex] !== dataNodes[dataNodeIndex + 1]?.valueHistory[dimensionIndex]) {
        totalMarginRatio += axisSegmentMarginRatio;
      }
    }
  }

  private obtainAutoMergedAxisSegmentAdjustmentOffsetAndAdjustmentOffsetRatioForSingleDimension(params: {
    dimensionAndValuesDict: { [dimensionName: string]: (string | number)[] };
    dimensionName: string;
    dataNodes: ParallelSetsDataNode[];
    dimensionIndex: number;
  }) {
    const { dimensionAndValuesDict, dimensionName, dataNodes, dimensionIndex } = params;

    let autoMergedAxisSegmentAdjustmentOffset = 0;
    let autoMergedAxisSegmentAdjustmentOffsetRatio = 0;
    const autoMergedAxisSegmentName = this.obtainAutoMergedAxisSegmentNameForDimension(dimensionName);
    if (dimensionAndValuesDict[dimensionName].find(value => value === this.autoMergedAxisSegmentName)) {
      const autoMergedAxisDataRecordCount = d3.sum(
        dataNodes.filter(dataNode => dataNode.valueHistory[dimensionIndex] === autoMergedAxisSegmentName).map(dataNode => dataNode.dataRecords.length),
      );
      if (autoMergedAxisDataRecordCount / this.data.length > this.autoMergedAxisSegmentMaxRatio) {
        autoMergedAxisSegmentAdjustmentOffset = (autoMergedAxisDataRecordCount - this.data.length * this.autoMergedAxisSegmentMaxRatio) / (1 - this.autoMergedAxisSegmentMaxRatio);
        autoMergedAxisSegmentAdjustmentOffsetRatio = autoMergedAxisSegmentAdjustmentOffset / autoMergedAxisDataRecordCount;
      }
    }
    return { autoMergedAxisSegmentAdjustmentOffset, autoMergedAxisSegmentAdjustmentOffsetRatio };
  }

  private removeEmptyDataNodesForDimensionAndDataNodeDict(dimensionAndDataNodesDict: { [dimensionName: string]: ParallelSetsDataNode[] }) {
    for (const [dimensionName, dataNodes] of Object.entries(dimensionAndDataNodesDict)) {
      dimensionAndDataNodesDict[dimensionName] = dataNodes.filter(dataNode => dataNode.dataRecords.length > 0);
    }
  }

  private fillDataRecordsIntoDimensionAndDataNodeDict(
    dimensionAndDataNodesDict: { [dimensionName: string]: ParallelSetsDataNode[] },
    dimensionAndValuesDict: { [dimensionName: string]: (string | number)[] },
  ) {
    const dataNodes = Object.values(dimensionAndDataNodesDict).flatMap(d => d);
    for (const dataRecord of this.data) {
      for (const dataNode of dataNodes) {
        let areAllPropertyMatched = true;
        for (let i = 0; i < dataNode.valueHistory.length; i++) {
          const currentDimensionName = this.dimensions[i];
          const currentValue = dataRecord[currentDimensionName];
          const autoMergedAxisSegmentName = this.obtainAutoMergedAxisSegmentNameForDimension(currentDimensionName);
          if (
            (dataNode.valueHistory[i] !== autoMergedAxisSegmentName && dataNode.valueHistory[i] !== currentValue) ||
            (dataNode.valueHistory[i] === autoMergedAxisSegmentName && dimensionAndValuesDict[currentDimensionName].find(d => d === currentValue) !== undefined)
          ) {
            areAllPropertyMatched = false;
            break;
          }
        }
        if (areAllPropertyMatched) {
          dataNode.dataRecords.push(dataRecord);
        }
      }
    }
  }

  private initializeDimensionAndDataNodeDict(dimensionAndValuesDict: { [dimensionName: string]: (string | number)[] }) {
    const dimensionAndDataNodesDict: { [dimensionName: string]: ParallelSetsDataNode[] } = {};

    for (let dimensionIndex = 0; dimensionIndex < this.dimensions.length; dimensionIndex++) {
      const currentDimensionName = this.dimensions[dimensionIndex];
      const previousDimensionName = this.dimensions[dimensionIndex - 1];
      const currentDimensionDataNodes: ParallelSetsDataNode[] = [];
      const currentDimensionValues = dimensionAndValuesDict[currentDimensionName];
      const previousDimensionValues = dimensionAndValuesDict[previousDimensionName];
      const previousDimensionDataNodes = dimensionAndDataNodesDict[previousDimensionName];
      const previousDimensionDataNodeCount = previousDimensionDataNodes?.length;

      for (let currentDimensionValueIndex = 0; currentDimensionValueIndex < currentDimensionValues.length; currentDimensionValueIndex++) {
        const previousDimensionValueCount = previousDimensionValues?.length || 0;
        const currentDimensionValue = currentDimensionValues[currentDimensionValueIndex];
        if (dimensionIndex < 1) {
          currentDimensionDataNodes[currentDimensionValueIndex] = Object.assign(new ParallelSetsDataNode(), {
            valueHistory: [currentDimensionValue],
          });
        } else {
          for (let previousDimensionDataNodeIndex = 0; previousDimensionDataNodeIndex < previousDimensionDataNodes.length; previousDimensionDataNodeIndex++) {
            const indexToInsert =
              previousDimensionDataNodeCount * currentDimensionValueIndex +
              previousDimensionValueCount * (previousDimensionDataNodeIndex % (previousDimensionDataNodeCount / previousDimensionValueCount)) +
              Math.floor(previousDimensionDataNodeIndex / (previousDimensionDataNodeCount / previousDimensionValueCount));
            const previousValueHistory = previousDimensionDataNodes[previousDimensionDataNodeIndex].valueHistory || [];
            const valueHistory = [...previousValueHistory, currentDimensionValue];
            currentDimensionDataNodes[indexToInsert] = Object.assign(new ParallelSetsDataNode(), {
              valueHistory,
            });
          }
        }
      }

      dimensionAndDataNodesDict[currentDimensionName] = currentDimensionDataNodes;
    }
    return dimensionAndDataNodesDict;
  }

  private generateDimensionAndValuesDict() {
    const dimensionValusDict = this.generateDimensionValuesDictWithoutMerging();
    this.mergeDimensionValuesForDimensionValuesDict(dimensionValusDict);
    return dimensionValusDict;
  }

  private mergeDimensionValuesForDimensionValuesDict(dimensionValusDict: { [dimensionName: string]: (string | number)[] }) {
    for (const currentDimensionName of this.dimensions) {
      const maxAxisSegmentCount: number = this.maxAxisSegmentCount?.[currentDimensionName] || this.maxAxisSegmentCount;
      const currentDimensionValues = dimensionValusDict[currentDimensionName];
      if (currentDimensionValues.length > maxAxisSegmentCount) {
        const spliceIndex = maxAxisSegmentCount - 1 > 0 ? maxAxisSegmentCount - 1 : 0;
        const autoMergedAxisSegmentName = this.obtainAutoMergedAxisSegmentNameForDimension(currentDimensionName);
        currentDimensionValues.splice(spliceIndex);
        currentDimensionValues.push(autoMergedAxisSegmentName);
      }
    }
  }

  private generateDimensionValuesDictWithoutMerging() {
    const dimensionValusDict: { [dimensionName: string]: (string | number)[] } = {};
    for (const currentDimensionName of this.dimensions) {
      const sortingMethod = this.dimensionValueSortingMethods?.[currentDimensionName] || this.dimensionValueSortingMethods?.[''] || this.dimensionValueSortingMethods;
      const currentDimensionValues = [...new Set(this.data.map(dataRecord => dataRecord[currentDimensionName]))].sort(sortingMethod);
      dimensionValusDict[currentDimensionName] = currentDimensionValues;
    }
    return dimensionValusDict;
  }

  private obtainAutoMergedAxisSegmentNameForDimension(dimensionName: string) {
    return (this.autoMergedAxisSegmentName?.[dimensionName] || this.autoMergedAxisSegmentName?.[''] || this.autoMergedAxisSegmentName) as string | number;
  }

  private obtainAxisPosition(width: number, margin: number, dimensionIndex: number) {
    return ((width - margin * 2 - this.axisBoxWidth) / (this.dimensions.length - 1)) * dimensionIndex + margin;
  }
}
