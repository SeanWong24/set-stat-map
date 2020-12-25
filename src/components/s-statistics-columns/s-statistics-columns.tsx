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

  render() {
    this.hostElement.style.setProperty("--column-count", this.statisticsColumnDefinitions.length.toString());

    return (
      <Host>
        <div id="main-container">
          {
            this.statisticsColumnDefinitions?.map(statisticsColumnDefinition => (
              <div
                style={{ backgroundColor: 'lightblue' }}
              >{statisticsColumnDefinition.dimensionName}</div>
            ))
          }
        </div>
      </Host>
    );
  }

}
