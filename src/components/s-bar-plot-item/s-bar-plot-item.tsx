import { Component, ComponentInterface, Host, h, Prop, Event, EventEmitter } from '@stencil/core';
import * as d3 from 'd3';

@Component({
  tag: 's-bar-plot-item',
  styleUrl: 's-bar-plot-item.css',
  shadow: true,
})
export class SBarPlotItem implements ComponentInterface {

  @Prop() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Prop() value: number;
  @Prop() minValue: number;
  @Prop() maxValue: number;
  @Prop() secondLevelMaxValue: number;
  @Prop() thirdLevelMaxValue: number;
  @Prop() fill: string = 'rgb(200,200,200)';
  @Prop() secondLevelFill: string = 'rgb(100,100,100)';
  @Prop() thirdLevelFill: string = 'rgb(0,0,0)';
  @Prop() exceedMaxLineStroke: string = 'rgb(255,255,255)';

  @Event() itemLoad: EventEmitter<{ value: number }>;

  render() {
    let firstLevelScale: d3.ScaleLinear<number, number>;
    let secondLevelScale: d3.ScaleLinear<number, number>;
    let thirdLevelScale: d3.ScaleLinear<number, number>;
    if (this.minValue !== undefined) {
      if (this.maxValue !== undefined) {
        firstLevelScale = d3.scaleLinear()
          .domain([this.minValue, this.maxValue])
          .range([0, 100])
          .clamp(true);
      }
      if (this.secondLevelMaxValue !== undefined) {
        secondLevelScale = d3.scaleLinear()
          .domain([this.maxValue, this.secondLevelMaxValue])
          .range([0, 100])
          .clamp(true);
      }
      if (this.thirdLevelMaxValue !== undefined) {
        thirdLevelScale = d3.scaleLinear()
          .domain([this.secondLevelMaxValue, this.thirdLevelMaxValue])
          .range([0, 100])
          .clamp(true);
      }
    }

    return (
      <Host>
        <svg
          id="main-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          ref={() => this.itemLoad.emit({
            value: this.value
          })}
        >
          <title>{this.value}</title>
          {
            this.orientation === 'horizontal' ?
              <g>
                {
                  firstLevelScale &&
                  <rect
                    id="first-segment"
                    x="0"
                    y="0"
                    width={this.adjustedScale(this.value, firstLevelScale, this.minValue, this.maxValue, 0, 100)}
                    height="100"
                    fill={this.fill}></rect>
                }
                {
                  secondLevelScale &&
                  <rect
                    id="second-segment"
                    x="0"
                    y="15"
                    width={this.adjustedScale(this.value, secondLevelScale, this.maxValue, this.secondLevelMaxValue, 0, 100)}
                    height="70"
                    fill={this.secondLevelFill}></rect>
                }
                {
                  thirdLevelScale &&
                  <rect
                    id="third-segment"
                    x="0"
                    y="30"
                    width={this.adjustedScale(this.value, thirdLevelScale, this.secondLevelMaxValue, this.thirdLevelMaxValue, 0, 100)}
                    height="40"
                    fill={this.thirdLevelFill}></rect>
                }
                {
                  (
                    (this.value > this.thirdLevelMaxValue) ||
                    (!thirdLevelScale && this.value > this.secondLevelMaxValue) ||
                    (!thirdLevelScale && !secondLevelScale && this.value > this.maxValue)
                  ) &&
                  <line
                    id="exceed-max-line"
                    x1="0"
                    y1="50"
                    x2="100"
                    y2="50"
                    stroke={this.exceedMaxLineStroke}
                    stroke-width="5"
                  ></line>
                }
              </g> :
              <g>
                {
                  firstLevelScale &&
                  <rect
                    id="first-segment"
                    x="0"
                    y="0"
                    width="100"
                    height={firstLevelScale(this.value)}
                    fill={this.fill}></rect>
                }
                {
                  secondLevelScale &&
                  <rect
                    id="second-segment"
                    x="15"
                    y="0"
                    width="70"
                    height={secondLevelScale(this.value)}
                    fill={this.secondLevelFill}></rect>
                }
                {
                  thirdLevelScale &&
                  <rect
                    id="third-segment"
                    x="30"
                    y="0"
                    width="40"
                    height={thirdLevelScale(this.value)}
                    fill={this.thirdLevelFill}></rect>
                }
                {
                  (
                    (this.value > this.thirdLevelMaxValue) ||
                    (!thirdLevelScale && this.value > this.secondLevelMaxValue) ||
                    (!thirdLevelScale && !secondLevelScale && this.value > this.maxValue)
                  ) &&
                  <line
                    id="exceed-max-line"
                    x1="50"
                    y1="0"
                    x2="50"
                    y2="100"
                    stroke={this.exceedMaxLineStroke}
                    stroke-width="5"
                  ></line>
                }
              </g>
          }
        </svg>
      </Host>
    );
  }

  private adjustedScale(
    value: number,
    scaleFunction: (value: number) => number,
    minDomain: number,
    maxDomain: number,
    minRange: number,
    maxRange: number
  ) {
    if (this.value <= minDomain) {
      return minRange;
    } else if (this.value >= maxDomain) {
      return maxRange;
    } else {
      return scaleFunction(value);
    }
  }

}