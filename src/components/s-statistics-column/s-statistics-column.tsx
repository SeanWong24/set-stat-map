import { Component, Host, h, Prop, ComponentInterface, Element, Event, EventEmitter } from '@stencil/core';
import * as d3 from 'd3';
import { StatisticsColumnsVisType } from '../s-statistics-columns/utils';

@Component({
  tag: 's-statistics-column',
  styleUrl: 's-statistics-column.css',
  shadow: true,
})
export class SStatisticsColumn implements ComponentInterface {

  private statisticsRowElementDict: { [rowValue: string]: HTMLElement } = {};
  private footerElement: SVGElement;

  @Element() hostElement: HTMLElement;

  @Prop() header: string;
  @Prop() data: { [rowValue: string]: number[] };
  @Prop() scaleMinMax: [number, number];
  @Prop() visType: StatisticsColumnsVisType;
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
  @Prop() rowOpacity: number = .5;
  @Prop() rowHighlightOpacity: number = .8;
  @Prop() headerTextSize: number = 16;
  @Prop() headerTextColor: string = 'rgb(0,0,0)';
  @Prop() headerTextWeight: string = 'bold';
  @Prop() footerAxisHeight: number = 16;
  @Prop() axisMargin: number = 10;

  @Event() headerClick: EventEmitter<string>;

  componentWillRender() {
    this.hostElement.style.setProperty('--row-opacity', this.rowOpacity.toString());
    this.hostElement.style.setProperty('--row-highlight-opacity', this.rowHighlightOpacity.toString());
    this.hostElement.style.setProperty('--axis-margin', this.axisMargin + 'px');
  }

  componentDidRender() {
    let scaleMinValue, scaleMaxValue;
    switch (this.visType) {
      case 'box':
        const allDataRecords = Object.values(this.data).flat();
        [scaleMinValue, scaleMaxValue] = this.scaleMinMax || [d3.min(allDataRecords), d3.max(allDataRecords)];
        break;
      case 'bar':
        [scaleMinValue, scaleMaxValue] = this.scaleMinMax || [0, d3.max(Object.values(this.data).map(d => d3.sum(d)))];
        break;
    }
    const svgWidth = this.footerElement.getBoundingClientRect().width - this.axisMargin * 2;
    const scale = d3.scaleLinear()
      .domain([scaleMinValue, scaleMaxValue])
      .range([0 + this.axisMargin, svgWidth + this.axisMargin]);
    d3.select(this.footerElement).call(d3.axisBottom(scale).ticks(3));
  }

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
              onClick={() => this.headerClick.emit(this.header)}
            >{this.header}</text>
            <div
              id="statistics-row-container"
              style={{
                height: `calc(100% - ${this.headerTextSize}px - ${this.footerAxisHeight}px)`,
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
                        top: `${minSegmentPosition * 100}%`,
                        height: `${(maxSegmentPosition - minSegmentPosition) * 100}%`
                      }}
                    >
                      <div
                        class="statistics-row-background"
                        style={{
                          backgroundColor: rowValueAndBackground.backgroundColor,
                          backgroundImage: rowValueAndBackground.backgroundImage,
                        }}
                      ></div>
                      {
                        this.renderPlotItem(rowValue)
                      }
                    </div>
                  );
                })
              }
            </div>
            <svg
              id="footer-axis"
              width="100%"
              height={this.footerAxisHeight}
              ref={el => this.footerElement = el}
            ></svg>
          </div>
        }
      </Host>
    );
  }

  private renderPlotItem(rowValue: string) {
    switch (this.visType) {
      case 'box':
        const allDataRecords = Object.values(this.data).flat();
        const [scaleMinValue, scaleMaxValue] = this.scaleMinMax || [d3.min(allDataRecords), d3.max(allDataRecords)];
        return (
          <s-box-plot-item
            class="plot-item"
            values={this.data[rowValue]}
            scaleMinValue={scaleMinValue}
            scaleMaxValue={scaleMaxValue}
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
        );
      case 'bar':
        const value = d3.sum(this.data[rowValue]);
        return (
          <s-bar-plot-item
            class="plot-item"
            value={value}
            minValue={0}
            maxValue={d3.max(Object.values(this.data).map(d => d3.sum(d)))}
            onItemLoad={({ detail }) => {
              this.statisticsRowElementDict[rowValue].title =
                `${rowValue}\n` +
                `value: ${detail.value}`
            }}
          ></s-bar-plot-item>
        );
    }
  }

}
