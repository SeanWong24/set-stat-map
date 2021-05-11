import { Component, Host, h, ComponentInterface, State, Element, Prop } from '@stencil/core';
import * as d3 from 'd3';

@Component({
  tag: 'app-heatmap-view',
  styleUrl: 'app-heatmap-view.css',
  scoped: true,
})
export class AppHeatmapView implements ComponentInterface {

  private readonly margin = 10;
  private readonly axisMargin = 50;

  @Element() hostElement: HTMLElement;

  @State() hostElementBoundingClientRect: DOMRect;

  @Prop() data: number[][];
  @Prop() xLabels: string[];
  @Prop() yLabels: string[];
  @Prop() header: string;
  @Prop() headerTextSize: number = 16;
  @Prop() headerTextColor: string = 'rgb(0,0,0)';
  @Prop() headerTextWeight: string = 'bold';

  connectedCallback() {
    const resizeObserver = new ResizeObserver(entryList => {
      for (const entry of entryList) {
        if (entry.target === this.hostElement) {
          this.hostElementBoundingClientRect = entry.target.getBoundingClientRect();
        }
      }
    });
    resizeObserver.observe(this.hostElement);
  }

  render() {
    if (this.data && this.xLabels && this.yLabels) {
      const { width, height } = this.hostElementBoundingClientRect || {};
      const scaleX = d3.scaleBand()
        .range([this.axisMargin + this.margin, width - this.margin])
        .domain(this.xLabels)
        .padding(.01);
      const scaleY = d3.scaleBand()
        .range([this.margin, height - this.axisMargin - this.margin])
        .domain(this.yLabels)
        .padding(.01);
      const colorScale = d3.scaleLinear()
        .range(['white', 'red'] as any)
        .domain([d3.min(this.data?.flatMap(d => d)), d3.max(this.data?.flatMap(d => d))]);

      return (
        <Host>
          <text
            id="header-text"
            style={{
              fontSize: `${this.headerTextSize}px`,
              color: this.headerTextColor,
              fontWeight: this.headerTextWeight
            }}
          >{this.header}</text>
          <svg width={width} height={`${height - this.headerTextSize}px`}>
            {
              this.xLabels && this.yLabels && this.data?.map((row, rowIndex) =>
                row?.map((value, columnIndex) => (
                  <rect
                    x={scaleX(this.xLabels[columnIndex])}
                    y={scaleY(this.yLabels[rowIndex])}
                    width={scaleX.bandwidth()}
                    height={scaleY.bandwidth()}
                    fill={colorScale(value).toString()}
                  >
                    <title>{`(${this.xLabels[columnIndex]}, ${this.yLabels[rowIndex]})\n${value}`}</title>
                  </rect>
                ))
              )
            }
            <g id="x-axis" transform={`translate(0, ${height - this.axisMargin})`} ref={el => d3.select(el).call(d3.axisBottom(scaleX))}></g>
            <g id="y-axis" transform={`translate(${this.axisMargin}, 0)`} ref={el => d3.select(el).call(d3.axisLeft(scaleY))}></g>
          </svg>
        </Host >
      );
    } else {
      return (
        <Host></Host>
      );
    }
  }

}
