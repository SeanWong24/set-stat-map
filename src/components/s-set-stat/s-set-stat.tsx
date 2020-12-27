import { Component, Host, h, Prop, State, ComponentInterface } from '@stencil/core';
import * as d3 from 'd3';
import { ParallelSetsDataNode, ParallelSetsDataRecord, SortingHandler } from '../s-parallel-sets/utils';
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
  // TODO also give default values for parallel sets props
  @Prop() colorScheme: string[] = ['#eddcd2', '#fff1e6', '#fde2e4', '#fad2e1', '#c5dedd', '#dbe7e4', '#f0efeb', '#d6e2e9', '#bcd4e6', '#99c1de'];
  @Prop() defineTexturesHandler: (textureGenerator: any) => (() => any)[];
  @Prop() dimensionDisplyedNameDict: { [dimensionName: string]: string };
  @Prop() parallelSetsDimensions: string[];
  @Prop() parallelSetsDimensionValueSortingMethods: SortingHandler | { [dimensionName: string]: SortingHandler };
  @Prop() parallelSetsMaxAxisSegmentCount: number | { [dimensionName: string]: number };
  @Prop() parallelSetsAutoMergedAxisSegmentName: string | { [dimensionName: string]: string };
  @Prop() parallelSetsAutoMergedAxisSegmentMaxRatio: number;
  @Prop() parallelSetsRibbonTension: number;
  @Prop() statisticsColumnDefinitions: { dimensionName: string, visType: StatisticsColumnsVisType }[] = [
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
          onVisLoad={({ detail }) => this.parallelSetsLoadHandler(detail)}
          axisHeaderTextColor={this.headerTextColor}
          axisHeaderTextWeight={this.headerTextWeight}
          dimensionDisplyedNameDict={this.dimensionDisplyedNameDict}
          dimensionValueSortingMethods={this.parallelSetsDimensionValueSortingMethods}
        ></s-parallel-sets>
        <s-statistics-columns
          style={{ width: this.statisticsColumnsWidth }}
          data={this.data}
          statisticsColumnDefinitions={this.statisticsColumnDefinitions}
          rowValueDimensionName={this.parallelSetsDimensions[this.parallelSetsDimensions.length - 1]}
          rowValueAndPositionDict={this.lastAxisSegmentValueAndPositionDict}
          rowValueAndBackgroundDict={this.lastAxisSegmentValueAndBackgroundDict}
          headerTextSize={this.headerTextSize}
          headerTextColor={this.headerTextColor}
          headerTextWeight={this.headerTextWeight}
        ></s-statistics-columns>
      </Host>
    );
  }

  private parallelSetsLoadHandler(
    eventDetail: {
      data: ParallelSetsDataRecord[],
      dimensions: string[],
      valuesDict: { [dimensionName: string]: (string | number)[] },
      dataNodesDict: { [dimensionName: string]: ParallelSetsDataNode[] }
    }
  ) {
    const {
      dimensions,
      valuesDict,
      dataNodesDict
    } = eventDetail;

    const lastDimensionIndex = dimensions.length - 1;
    const lastDimensionName = dimensions[lastDimensionIndex];
    const lastDimensionDataNodes = dataNodesDict[lastDimensionName];
    const lastDimensionValues = valuesDict[lastDimensionName];
    const firstDimensionValues = valuesDict[this.parallelSetsDimensions[0]];
    const colorScale = d3.scaleOrdinal(this.colorScheme);

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
    let valuesAndRatios: { value: string | number; ratio: number; adjustedRatio: number; }[] = [];
    let previousRatio = 0;
    for (const firstDimensionValue of firstDimensionValues) {
      const dataNodesForTheFirstDimensionValueAndTheLastDimensionValue = dataNodesForTheValue.filter(dataNode => dataNode.valueHistory[0] === firstDimensionValue);
      const axisSegmentDataRecordCountForFirstDimensionValue = d3.sum(dataNodesForTheFirstDimensionValueAndTheLastDimensionValue.map(dataNode => dataNode.dataRecords.length));
      const valueRatio = axisSegmentDataRecordCountForFirstDimensionValue / axisSegmentDataRecordCount;
      valuesAndRatios.push({ value: firstDimensionValue, ratio: valueRatio, adjustedRatio: valueRatio / 2 + previousRatio });
      previousRatio += valueRatio;
    }
    const largestRatioValue = valuesAndRatios.sort((a, b) => b.ratio - a.ratio)[0].value;
    const colorsAndRatiosForLinearGradient = valuesAndRatios
      .sort((a, b) => a.adjustedRatio - b.adjustedRatio)
      .map(({ value, adjustedRatio }) => `${colorScale(value.toString())} ${adjustedRatio * 100}%`)
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
