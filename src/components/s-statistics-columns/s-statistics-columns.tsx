import { Component, Host, h, Element, Prop } from '@stencil/core';

@Component({
  tag: 's-statistics-columns',
  styleUrl: 's-statistics-columns.css',
  shadow: true,
})
export class SStatisticsColumns {

  @Element() hostElement: HTMLElement;

  @Prop() data: any[];
  @Prop() statisticsColumnDefinitions: { dimensionName: string, visType: string }[];
  @Prop() rowValueAndPositionDict: {
    [value: string]: {
      minSegmentPosition: number;
      maxSegmentPosition: number;
    }
  };
  @Prop() rowValueAndBackgroundDict: {
    [value: string]: {
      backgroundColor: string;
      backgroundImage: string;
    }
  };
  @Prop() headerTextSize: number = 16;
  @Prop() headerTextColor: string | { [dimensionName: string]: string } = 'rgb(0,0,0)';
  @Prop() headerTextWeight: string | { [dimensionName: string]: string } = 'bold';

  render() {
    this.hostElement.style.setProperty("--column-count", this.statisticsColumnDefinitions.length.toString());

    return (
      <Host>
        <div id="main-container">
          {
            this.statisticsColumnDefinitions?.map(statisticsColumnDefinition => (
              <s-statistics-column
                data={this.data.map(d => d[statisticsColumnDefinition.dimensionName])}
                header={statisticsColumnDefinition.dimensionName}
                rowValueAndPositionDict={this.rowValueAndPositionDict}
                rowValueAndBackgroundDict={this.rowValueAndBackgroundDict}
                headerTextSize={this.headerTextSize}
                headerTextColor={this.obtainHeaderTextColorForDimension(statisticsColumnDefinition.dimensionName)}
                headerTextWeight={this.obtainHeaderTextWeightForDimension(statisticsColumnDefinition.dimensionName)}
              ></s-statistics-column>
            ))
          }
        </div>
      </Host>
    );
  }

  private obtainHeaderTextColorForDimension(dimensionName: string) {
    return this.headerTextColor?.[dimensionName] || this.headerTextColor?.[''] || this.headerTextColor;
  }

  private obtainHeaderTextWeightForDimension(dimensionName: string) {
    return this.headerTextWeight?.[dimensionName] || this.headerTextWeight?.[''] || this.headerTextWeight;
  }

}
