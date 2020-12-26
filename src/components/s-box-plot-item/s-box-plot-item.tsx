import { Component, Host, h, ComponentInterface, Prop, Event, EventEmitter } from '@stencil/core';
import * as d3 from 'd3';

@Component({
  tag: 's-box-plot-item',
  styleUrl: 's-box-plot-item.css',
  shadow: true,
})
export class SBoxPlotItem implements ComponentInterface {

  @Prop() values: number[];
  @Prop() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Prop() scaleMinValue: number;
  @Prop() scaleMaxValue: number;
  @Prop() boxFill: string = 'rgb(240,255,255)';
  @Prop() boxStroke: string = 'rgb(0,0,0)';
  @Prop() connectionLineStroke: string = 'rgb(0,0,0)';
  @Prop() minLineStroke: string = 'rgb(0,0,0)';
  @Prop() medianLineStroke: string = 'rgb(0,0,0)';
  @Prop() maxLineStroke: string = 'rgb(0,0,0)';
  @Prop() enableTooltip: boolean = true;

  @Event() itemLoad: EventEmitter<{ min: number, q1: number, median: number, q3: number, max: number }>;

  render() {
    const sortedData = this.values.sort(d3.ascending);
    const q1 = d3.quantile(sortedData, .25);
    const median = d3.quantile(sortedData, .5);
    const q3 = d3.quantile(sortedData, .75);
    const minValue = Math.min(...sortedData);
    const maxValue = Math.max(...sortedData);

    const scaleMinValue = (this.scaleMinValue === undefined) ? minValue : this.scaleMinValue;
    const scaleMaxValue = (this.scaleMaxValue === undefined) ? maxValue : this.scaleMaxValue;

    const scale = d3.scaleLinear()
      .domain([scaleMinValue, scaleMaxValue])
      .range([0, 100]);

    return (
      <Host>
        <svg
          id="main-svg"
          ref={() => this.itemLoad.emit({
            min: minValue,
            q1,
            median,
            q3,
            max: maxValue
          })}
          viewBox={this.orientation === 'horizontal' ? '0 0 100 10' : '0 0 10 100'}
          preserveAspectRatio="none"
        >
          {
            this.enableTooltip &&
            <title>{
              'min: ' + minValue + '\n' +
              '25%: ' + q1 + '\n' +
              'median: ' + median + '\n' +
              '75%: ' + q3 + '\n' +
              'max: ' + maxValue
            }</title>
          }
          {
            this.orientation === 'horizontal' ?
              <g>
                <line
                  id="min-line"
                  x1={scale(minValue)}
                  y1="0"
                  x2={scale(minValue)}
                  y2="10"
                  stroke={this.minLineStroke} />
                <line
                  id="min-q1-line"
                  x1={scale(minValue)}
                  y1="5"
                  x2={scale(q1)}
                  y2="5"
                  stroke={this.connectionLineStroke} />
                <rect
                  id="box"
                  x={scale(q1)}
                  y="0"
                  width={scale(q3) - scale(q1)}
                  height="10"
                  stroke={this.boxStroke}
                  fill={this.boxFill} />
                <line
                  id="median-line"
                  x1={scale(median)}
                  y1="0"
                  x2={scale(median)}
                  y2="10"
                  stroke={this.medianLineStroke} />
                <line
                  id="q1-max-line"
                  x1={scale(q3)}
                  y1="5"
                  x2={scale(maxValue)}
                  y2="5"
                  stroke={this.connectionLineStroke} />
                <line
                  id="max-line"
                  x1={scale(maxValue)}
                  y1="0"
                  x2={scale(maxValue)}
                  y2="10"
                  stroke={this.maxLineStroke} />
              </g> :
              <g>
                <line
                  id="min-line"
                  x1="0"
                  y1={scale(minValue)}
                  x2="10"
                  y2={scale(minValue)}
                  stroke={this.minLineStroke} />
                <line
                  id="min-q1-line"
                  x1="5"
                  y1={scale(minValue)}
                  x2="5"
                  y2={scale(q1)}
                  stroke={this.connectionLineStroke} />
                <rect
                  id="box"
                  x="0"
                  y={scale(q1)}
                  width="10"
                  height={scale(q3) - scale(q1)}
                  stroke={this.boxStroke}
                  fill={this.boxFill} />
                <line
                  id="median-line"
                  x1="0"
                  y1={scale(median)}
                  x2="10"
                  y2={scale(median)}
                  stroke={this.medianLineStroke} />
                <line
                  id="q1-max-line"
                  x1="5"
                  y1={scale(q3)}
                  x2="5"
                  y2={scale(maxValue)}
                  stroke={this.connectionLineStroke} />
                <line
                  id="max-line"
                  x1="0"
                  y1={scale(maxValue)}
                  x2="10"
                  y2={scale(maxValue)}
                  stroke={this.maxLineStroke} />
              </g>
          }
        </svg>
      </Host>
    );
  }

}
