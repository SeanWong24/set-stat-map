import { Component, Host, h, Prop, State } from '@stencil/core';
import { ParallelSetsDataNode, ParallelSetsDataRecord } from '../s-parallel-sets/utils';

@Component({
  tag: 's-set-stat',
  styleUrl: 's-set-stat.css',
  shadow: true,
})
export class SSetStat {

  @Prop() data: any[] = [];
  @Prop() parallelSetsWidth: string = '60%';
  @Prop() statisticsColumnsWidth: string = '40%';
  @Prop() headerTextSize: number = 16;
  @Prop() headerTextColor: string | { [dimensionName: string]: string } = 'rgb(0,0,0)';
  @Prop() headerTextWeight: string | { [dimensionName: string]: string } = 'bold';
  // TODO also give default values for parallel sets props
  @Prop() colorScheme: string[];
  @Prop() defineTexturesHandler: (textureGenerator: any) => (() => any)[];
  @Prop() parallelSetsDimensions: string[];
  @Prop() parallelSetsMaxAxisSegmentCount: number | { [dimensionName: string]: number };
  @Prop() parallelSetsAutoMergedAxisSegmentName: string | { [dimensionName: string]: string };
  @Prop() parallelSetsAutoMergedAxisSegmentMaxRatio: number;
  @Prop() parallelSetsRibbonTension: number;
  @Prop() statisticsColumnDefinitions: { dimensionName: string, visType: string }[] = [
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
        ></s-parallel-sets>
        <s-statistics-columns
          style={{ width: this.statisticsColumnsWidth }}
          data={this.data}
          statisticsColumnDefinitions={this.statisticsColumnDefinitions}
          rowValueAndPositionDict={this.lastAxisSegmentValueAndPositionDict}
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
    this.lastAxisSegmentValueAndPositionDict =
      this.generateLastAxisSegmentValueAndPositionDict(dimensions, dataNodesDict, valuesDict);
  }


  private generateLastAxisSegmentValueAndPositionDict(
    dimensions: string[],
    dataNodesDict: { [dimensionName: string]: ParallelSetsDataNode[]; },
    valuesDict: { [dimensionName: string]: (string | number)[]; }
  ) {
    const lastDimensionIndex = dimensions.length - 1;
    const lastDimensionName = dimensions[lastDimensionIndex];
    const lastDimensionDataNodes = dataNodesDict[lastDimensionName];
    const lastDimensionValues = valuesDict[lastDimensionName];
    const lastAxisSegmentValueAndPositionDict = Object.fromEntries(
      lastDimensionValues.map(value => [value.toString(), { minSegmentPosition: NaN, maxSegmentPosition: NaN }])
    );
    for (const lastDimensionDataNode of lastDimensionDataNodes) {
      const lastDimensionValue = lastDimensionDataNode.valueHistory[lastDimensionIndex];
      const axisSegmentPosition = lastAxisSegmentValueAndPositionDict[lastDimensionValue.toString()];
      const minAxisSegmentPosition = lastDimensionDataNode.adjustedAxisSegmentPosition[0];
      if (Number.isNaN(axisSegmentPosition.minSegmentPosition) || axisSegmentPosition.minSegmentPosition > minAxisSegmentPosition) {
        axisSegmentPosition.minSegmentPosition = minAxisSegmentPosition;
      }
      const maxAxisSegmentPosition = lastDimensionDataNode.adjustedAxisSegmentPosition[1];
      if (Number.isNaN(axisSegmentPosition.maxSegmentPosition) || axisSegmentPosition.maxSegmentPosition < maxAxisSegmentPosition) {
        axisSegmentPosition.maxSegmentPosition = maxAxisSegmentPosition;
      }
    }
    return lastAxisSegmentValueAndPositionDict;
  }
}
