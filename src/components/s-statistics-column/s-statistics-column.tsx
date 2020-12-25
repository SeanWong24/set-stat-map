import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 's-statistics-column',
  styleUrl: 's-statistics-column.css',
  shadow: true,
})
export class SStatisticsColumn {

  @Prop() header: string;
  @Prop() data: number[];

  render() {
    return (
      <Host>
        <div
          style={{
            backgroundColor: 'lightblue',
            height: '100%'
          }}
        >{this.header}</div>
      </Host>
    );
  }

}
