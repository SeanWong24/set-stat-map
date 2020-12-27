import { Component, Host, h, Element, Prop, ComponentInterface } from '@stencil/core';
import { StatisticsColumnsVisType } from './utils';

@Component({
  tag: 's-statistics-columns',
  styleUrl: 's-statistics-columns.css',
  shadow: true,
})
export class SStatisticsColumns implements ComponentInterface {

  @Element() hostElement: HTMLElement;

  @Prop() data: any[];
  @Prop() statisticsColumnDefinitions: { dimensionName: string, visType: StatisticsColumnsVisType }[];
  @Prop() rowValueDimensionName: string;
  @Prop() dimensionDisplyedNameDict: { [dimensionName: string]: string };
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
        {
          this.data && this.rowValueAndPositionDict && this.rowValueAndBackgroundDict &&
          <div id="main-container">
            {
              this.statisticsColumnDefinitions?.map(statisticsColumnDefinition => {
                const dimensionName = statisticsColumnDefinition.dimensionName;
                const dataForColumn: { [rowValue: string]: number[] } = {};
                for (const rowValue of Object.keys(this.rowValueAndPositionDict)) {
                  dataForColumn[rowValue] = this.data
                    .filter(dataRecord => dataRecord[this.rowValueDimensionName] === rowValue)
                    .map(dataRecord => dataRecord[statisticsColumnDefinition.dimensionName]);
                }
                return (
                  <s-statistics-column
                    data={dataForColumn}
                    header={this.dimensionDisplyedNameDict?.[dimensionName] || dimensionName}
                    rowValueAndPositionDict={this.rowValueAndPositionDict}
                    rowValueAndBackgroundDict={this.rowValueAndBackgroundDict}
                    headerTextSize={this.headerTextSize}
                    headerTextColor={this.obtainHeaderTextColorForDimension(statisticsColumnDefinition.dimensionName)}
                    headerTextWeight={this.obtainHeaderTextWeightForDimension(statisticsColumnDefinition.dimensionName)}
                  ></s-statistics-column>
                );
              })
            }
          </div>
        }
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
