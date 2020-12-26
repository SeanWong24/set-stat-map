import { Component, Host, h, Prop, ComponentInterface } from '@stencil/core';
import * as d3 from 'd3';

@Component({
  tag: 's-statistics-column',
  styleUrl: 's-statistics-column.css',
  shadow: true,
})
export class SStatisticsColumn implements ComponentInterface {

  private statisticsRowElementDict: { [rowValue: string]: HTMLElement } = {};

  @Prop() header: string;
  @Prop() data: { [rowValue: string]: number[] };
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
  @Prop() headerTextColor: string = 'rgb(0,0,0)';
  @Prop() headerTextWeight: string = 'bold';

  render() {
    const allDataRecords = Object.values(this.data).flat();
    return (
      <Host>
        {
          this.data && this.rowValueAndPositionDict && this.rowValueAndBackgroundDict &&
          <div
            id="main-container"
            style={{
              height: '100%'
            }}
          >
            <text
              id="header-text"
              style={{
                fontSize: `${this.headerTextSize}px`,
                color: this.headerTextColor,
                fontWeight: this.headerTextWeight
              }}
            >{this.header}</text>
            <div
              id="statistics-row-container"
              style={{
                height: `calc(100% - ${this.headerTextSize}px)`,
                top: `${this.headerTextSize}px`
              }}
            >
              {
                Object.entries(this.rowValueAndPositionDict).map(([rowValue, { minSegmentPosition, maxSegmentPosition }]) => {
                  const rowValueAndBackground = this.rowValueAndBackgroundDict[rowValue];
                  return (
                    <div
                      class="statistics-row"
                      ref={el => this.statisticsRowElementDict[rowValue] = el}
                      style={{
                        backgroundColor: rowValueAndBackground.backgroundColor,
                        backgroundImage: rowValueAndBackground.backgroundImage,
                        top: `${minSegmentPosition * 100}%`,
                        height: `${(maxSegmentPosition - minSegmentPosition) * 100}%`
                      }}
                    >
                      <s-box-plot-item
                        class="plot-item"
                        values={this.data[rowValue]}
                        scaleMinValue={d3.min(allDataRecords)}
                        scaleMaxValue={d3.max(allDataRecords)}
                        enableTooltip={false}
                        onItemLoad={({ detail }) => {
                          this.statisticsRowElementDict[rowValue].title =
                            `${rowValue}\n` +
                            `min: ${detail.min}\n` +
                            `25%: ${detail.q1}\n` +
                            `median: ${detail.median}\n` +
                            `75%: ${detail.q3}\n` +
                            `max: ${detail.max}`
                        }}
                      ></s-box-plot-item>
                    </div>
                  );
                })
              }
            </div>
          </div>
        }
      </Host>
    );
  }

}
