import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 's-set-stat',
  styleUrl: 's-set-stat.css',
  shadow: true,
})
export class SSetStat {

  @Prop() data: any[] = [];
  @Prop() parallelSetsWidth: string = '60%';
  @Prop() statisticsColumnsWidth: string = '40%';
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

  render() {
    return (
      <Host>
        <s-parallel-sets
          style={{ width: this.parallelSetsWidth }}
          data={this.data}
          dimensions={this.parallelSetsDimensions}
          colorScheme={this.colorScheme}
          maxAxisSegmentCount={this.parallelSetsMaxAxisSegmentCount}
          autoMergedAxisSegmentName={this.parallelSetsAutoMergedAxisSegmentName}
          autoMergedAxisSegmentMaxRatio={this.parallelSetsAutoMergedAxisSegmentMaxRatio}
          defineTexturesHandler={this.defineTexturesHandler}
          ribbonTension={this.parallelSetsRibbonTension}
        ></s-parallel-sets>
        <s-statistics-columns
          style={{ width: this.statisticsColumnsWidth }}
          data={this.data}
          statisticsColumnDefinitions={this.statisticsColumnDefinitions}
        ></s-statistics-columns>
      </Host>
    );
  }

}
