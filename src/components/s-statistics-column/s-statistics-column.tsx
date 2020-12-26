import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 's-statistics-column',
  styleUrl: 's-statistics-column.css',
  shadow: true,
})
export class SStatisticsColumn {

  @Prop() header: string;
  @Prop() data: number[];
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
                      style={{
                        backgroundColor: rowValueAndBackground.backgroundColor,
                        backgroundImage: rowValueAndBackground.backgroundImage,
                        top: `${minSegmentPosition * 100}%`,
                        height: `${(maxSegmentPosition - minSegmentPosition) * 100}%`
                      }}
                    ></div>
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
