import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 's-set-stat',
  styleUrl: 's-set-stat.css',
  shadow: true,
})
export class SSetStat {

  @Prop() data: any[] = [];
  @Prop() parallelSetsWidth: string = '60%';
  // TODO also give default values for parallel sets props
  @Prop() colorScheme: string[];
  @Prop() defineTexturesHandler: (textureGenerator: any) => (() => any)[];
  @Prop() parallelSetsDimensions: string[];
  @Prop() parallelSetsMaxAxisSegmentCount: number | { [dimensionName: string]: number };
  @Prop() parallelSetsAutoMergedAxisSegmentName: string | { [dimensionName: string]: string };
  @Prop() parallelSetsAutoMergedAxisSegmentMaxRatio: number;
  @Prop() parallelSetsRibbonTension: number;

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
      </Host>
    );
  }

}
