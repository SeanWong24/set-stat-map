import { Component, Host, h, Prop, State, ComponentInterface, Event, EventEmitter, Method } from '@stencil/core';
import * as d3 from 'd3';
import { ParallelSetsDataNode, ParallelSetsOnLoadDetail, ParallelSetsDimensionValueSortingHandler } from '../s-parallel-sets/utils';
import { StatisticsColumnsVisType } from '../s-statistics-columns/utils';

@Component({
  tag: 's-set-stat',
  styleUrl: 's-set-stat.css',
  shadow: true,
})
export class SSetStat implements ComponentInterface {

  @Prop() data: any[] = [];
  @Prop() parallelSetsWidth: string = '60%';
  @Prop() statisticsColumnsWidth: string = '40%';
  @Prop() headerTextSize: number = 16;
  @Prop() headerTextColor: string | { [dimensionName: string]: string } = 'rgb(0,0,0)';
  @Prop() headerTextWeight: string | { [dimensionName: string]: string } = 'bold';
  @Prop() ribbonAndRowOpacity: number = .5;
  @Prop() ribbonAndRowHighlightOpacity: number = .8;
  // TODO also give default values for parallel sets props
  @Prop() colorScheme: string[] = ['#eddcd2', '#fff1e6', '#fde2e4', '#fad2e1', '#c5dedd', '#dbe7e4', '#f0efeb', '#d6e2e9', '#bcd4e6', '#99c1de'];
  @Prop() defineTexturesHandler: (textureGenerator: any) => (() => any)[];
  @Prop() dimensionDisplyedNameDict: { [dimensionName: string]: string };
  @Prop() parallelSetsDimensions: string[];
  @Prop({ mutable: true }) parallelSetsDimensionValueSortingMethods: ParallelSetsDimensionValueSortingHandler | { [dimensionName: string]: ParallelSetsDimensionValueSortingHandler };
  @Prop() parallelSetsMaxAxisSegmentCount: number | { [dimensionName: string]: number };
  @Prop() parallelSetsAutoMergedAxisSegmentName: string | { [dimensionName: string]: string };
  @Prop() parallelSetsAutoMergedAxisSegmentMaxRatio: number;
  @Prop() parallelSetsRibbonTension: number;
  @Prop() parallelSetsFooter: string | { [dimensionName: string]: string } = ' ';
  @Prop() statisticsColumnDefinitions: { dimensionName: string, visType: StatisticsColumnsVisType, scaleMinMax?: [number, number] }[] = [
    { dimensionName: 'D1', visType: 'box' },
    { dimensionName: 'D2', visType: 'box' },
    { dimensionName: 'D3', visType: 'box' }
  ];

  @State() lastAxisSegmentValueAndPositionDict: {
    [value: string]: {
      minSegmentPosition: number;
      maxSegmentPosition: number;
    }
  };
  @State() lastAxisSegmentValueAndBackgroundDict: {
    [value: string]: {
      backgroundColor: string;
      backgroundImage: string;
    };
  };

  @Event() visWillRender: EventEmitter;
  @Event() visLoad: EventEmitter<ParallelSetsOnLoadDetail>;
  @Event() parallelSetsAxisSegmentClick: EventEmitter<{ dimensionName: string, value: string | number, count: number, proportion: number, dataNodes: ParallelSetsDataNode[] }>;
  @Event() statisticsColumnsHeaderClick: EventEmitter<string>;

  @Method()
  async reorderParallelSetsLastAxisByDimension(dimensionName?: string, orderBy?: 'ascending' | 'descending') {
    const obtainMedian = dataValue => {
      const dataRecords = this.data.filter(dataRecord => dataRecord['Date'] === dataValue);
      const values = dataRecords.map(dataRecord => +dataRecord[dimensionName]);
      const median = d3.median(values);
      return median;
    };
    let parallelSetsLastAxisSortingMethod: ParallelSetsDimensionValueSortingHandler;
    if (dimensionName && orderBy === 'ascending') {
      parallelSetsLastAxisSortingMethod = (a, b) => d3.ascending(obtainMedian(a), obtainMedian(b));
    } else if (dimensionName && orderBy === 'descending') {
      parallelSetsLastAxisSortingMethod = (a, b) => d3.descending(obtainMedian(a), obtainMedian(b));
      this.headerTextColor = 'black';
    } else {
      parallelSetsLastAxisSortingMethod = undefined;
    }

    if (this.parallelSetsDimensionValueSortingMethods) {
      this.parallelSetsDimensionValueSortingMethods['Date'] = parallelSetsLastAxisSortingMethod;
    } else {
      this.parallelSetsDimensionValueSortingMethods = {
        '': (a, b) => +a.toString().split(' ~ ')[0] - +b.toString().split(' ~ ')[0],
        'Date': parallelSetsLastAxisSortingMethod
      };
    }

    return this.parallelSetsDimensionValueSortingMethods;
  }

  componentWillRender() {
    this.visWillRender.emit();
  }

  render() {

    return (
      <Host>
        <s-parallel-sets
          style={{ width: this.parallelSetsWidth }}
          data={this.data}
          dimensions={this.parallelSetsDimensions}
          axisHeaderTextSize={this.headerTextSize}
          colorScheme={this.colorScheme}
          maxAxisSegmentCount={this.parallelSetsMaxAxisSegmentCount}
          autoMergedAxisSegmentName={this.parallelSetsAutoMergedAxisSegmentName}
          autoMergedAxisSegmentMaxRatio={this.parallelSetsAutoMergedAxisSegmentMaxRatio}
          defineTexturesHandler={this.defineTexturesHandler}
          ribbonTension={this.parallelSetsRibbonTension}
          ribbonOpacity={this.ribbonAndRowOpacity}
          ribbonHighlightOpacity={this.ribbonAndRowHighlightOpacity}
          onVisLoad={({ detail }) => this.parallelSetsLoadHandler(detail)}
          axisHeaderTextColor={this.headerTextColor}
          axisHeaderTextWeight={this.headerTextWeight}
          axisFooter={this.parallelSetsFooter}
          dimensionDisplyedNameDict={this.dimensionDisplyedNameDict}
          dimensionValueSortingMethods={this.parallelSetsDimensionValueSortingMethods}
          onAxisSegmentClick={({ detail }) => this.parallelSetsAxisSegmentClick.emit(detail)}
        ></s-parallel-sets>
        <s-statistics-columns
          style={{ width: this.statisticsColumnsWidth }}
          data={this.data}
          statisticsColumnDefinitions={this.statisticsColumnDefinitions}
          rowValueDimensionName={this.parallelSetsDimensions[this.parallelSetsDimensions.length - 1]}
          rowValueAndPositionDict={this.lastAxisSegmentValueAndPositionDict}
          rowValueAndBackgroundDict={this.lastAxisSegmentValueAndBackgroundDict}
          dimensionDisplyedNameDict={this.dimensionDisplyedNameDict}
          headerTextSize={this.headerTextSize}
          headerTextColor={this.headerTextColor}
          headerTextWeight={this.headerTextWeight}
          rowOpacity={this.ribbonAndRowOpacity}
          rowHighlightOpacity={this.ribbonAndRowHighlightOpacity}
          onColumnHeaderClick={({ detail }) => this.statisticsColumnsHeaderClick.emit(detail)}
        ></s-statistics-columns>
      </Host>
    );
  }

  private parallelSetsLoadHandler(eventDetail: ParallelSetsOnLoadDetail) {
    const {
      dimensions,
      valuesDict,
      dataNodesDict
    } = eventDetail;
    setTimeout(() => this.visLoad.emit(eventDetail));

    const lastDimensionIndex = dimensions.length - 1;
    const lastDimensionName = dimensions[lastDimensionIndex];
    const lastDimensionDataNodes = dataNodesDict[lastDimensionName];
    const lastDimensionValues = valuesDict[lastDimensionName];
    const parallelSetsDimensionValueSortingMethod = this.parallelSetsDimensionValueSortingMethods?.[this.parallelSetsDimensions[0]] || this.parallelSetsDimensionValueSortingMethods?.[''] || this.parallelSetsDimensionValueSortingMethods;
    const firstDimensionValues = valuesDict[this.parallelSetsDimensions[0]]
      .sort(parallelSetsDimensionValueSortingMethod);
    const colorScale = d3.scaleOrdinal(this.colorScheme)
      .domain(firstDimensionValues.map(value => value.toString()));

    const lastAxisSegmentValueAndBackgroundDict = Object.fromEntries(
      lastDimensionValues.map(value => [value.toString(), { backgroundColor: '', backgroundImage: '' }])
    );
    const lastAxisSegmentValueAndPositionDict = Object.fromEntries(
      lastDimensionValues.map(value => [value.toString(), { minSegmentPosition: NaN, maxSegmentPosition: NaN }])
    );

    for (const lastDimensionValue of lastDimensionValues) {
      const dataNodesForTheValue = lastDimensionDataNodes
        .filter(dataNode => dataNode.valueHistory[lastDimensionIndex] === lastDimensionValue);

      this.fillLastAxisSegmentValueAndPositionDictForSingleValue({
        lastAxisSegmentValueAndPositionDict,
        lastDimensionValue,
        dataNodesForTheValue
      });
      this.fillLastAxisSegmentValueAndBackgroundDictForSingleValue({
        dataNodesForTheValue,
        firstDimensionValues,
        colorScale,
        lastAxisSegmentValueAndBackgroundDict,
        lastDimensionValue
      });
    }

    this.lastAxisSegmentValueAndPositionDict = lastAxisSegmentValueAndPositionDict;
    this.lastAxisSegmentValueAndBackgroundDict = lastAxisSegmentValueAndBackgroundDict;
  }


  private fillLastAxisSegmentValueAndBackgroundDictForSingleValue(params: {
    dataNodesForTheValue: ParallelSetsDataNode[],
    firstDimensionValues: (string | number)[],
    colorScale: d3.ScaleOrdinal<string, string, never>,
    lastAxisSegmentValueAndBackgroundDict: { [value: string]: { backgroundColor: string; backgroundImage: string; }; },
    lastDimensionValue: string | number
  }) {
    const {
      dataNodesForTheValue,
      firstDimensionValues,
      colorScale,
      lastAxisSegmentValueAndBackgroundDict,
      lastDimensionValue
    } = params;

    const axisSegmentDataRecordCount = d3.sum(dataNodesForTheValue.map(dataNode => dataNode.dataRecords.length));
    let valuesAndRatios: { value: string | number; ratio: number; startRatio: number; }[] = [];
    let previousRatio = 0;
    for (const firstDimensionValue of firstDimensionValues) {
      const dataNodesForTheFirstDimensionValueAndTheLastDimensionValue = dataNodesForTheValue.filter(dataNode => dataNode.valueHistory[0] === firstDimensionValue);
      const axisSegmentDataRecordCountForFirstDimensionValue = d3.sum(dataNodesForTheFirstDimensionValueAndTheLastDimensionValue.map(dataNode => dataNode.dataRecords.length));
      const valueRatio = axisSegmentDataRecordCountForFirstDimensionValue / axisSegmentDataRecordCount;
      valuesAndRatios.push({ value: firstDimensionValue, ratio: valueRatio, startRatio: previousRatio });
      previousRatio += valueRatio;
    }
    const largestRatioValue = valuesAndRatios.sort((a, b) => b.ratio - a.ratio)[0].value;
    const colorsAndRatiosForLinearGradient = valuesAndRatios
      .filter(({ ratio }) => ratio > 0)
      .sort((a, b) => a.startRatio - b.startRatio)
      .map(({ value, ratio, startRatio }) => `${colorScale(value.toString())} ${(startRatio + ratio * .2) * 100}%, ${colorScale(value.toString())} ${(startRatio + ratio * .8) * 100}%`)
      .join(', ');
    lastAxisSegmentValueAndBackgroundDict[lastDimensionValue.toString()] = {
      backgroundColor: colorScale(largestRatioValue.toString()),
      backgroundImage: valuesAndRatios.length > 1 ?
        `linear-gradient(to right, ${colorsAndRatiosForLinearGradient})` :
        'unset'
    };
  }

  private fillLastAxisSegmentValueAndPositionDictForSingleValue(params: {
    lastAxisSegmentValueAndPositionDict: { [value: string]: { minSegmentPosition: number; maxSegmentPosition: number; }; },
    lastDimensionValue: string | number,
    dataNodesForTheValue: ParallelSetsDataNode[]
  }) {
    const {
      lastAxisSegmentValueAndPositionDict,
      lastDimensionValue,
      dataNodesForTheValue
    } = params;

    lastAxisSegmentValueAndPositionDict[lastDimensionValue.toString()] = {
      minSegmentPosition: d3.min(dataNodesForTheValue.map(dataNode => dataNode.adjustedAxisSegmentPosition[0])),
      maxSegmentPosition: d3.max(dataNodesForTheValue.map(dataNode => dataNode.adjustedAxisSegmentPosition[1]))
    };
  }
}
