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
  @Prop() headerTextSize: number = 16;

  render() {
    return (
      <Host>
        {
          this.data && this.rowValueAndPositionDict &&
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
                fontWeight: 'bold'
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
                Object.values(this.rowValueAndPositionDict).map(({ minSegmentPosition, maxSegmentPosition }) => (
                  <div
                    class="statistics-row"
                    style={{
                      backgroundColor: 'lightblue',
                      top: `${minSegmentPosition * 100}%`,
                      height: `${(maxSegmentPosition - minSegmentPosition) * 100}%`
                    }}
                  ></div>
                ))
              }
            </div>
          </div>
        }
      </Host>
    );
  }

}
