import { Component, h, Host } from '@stencil/core';
import { data, dimensions } from '../../global/temp';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css',
})
export class AppHome {
  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Home</ion-title>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <s-set-stat
            style={{ width: '800px', height: '600px' }}
            data={data}
            parallelSetsDimensions={dimensions}
          ></s-set-stat>
        </ion-content>
      </Host>
    );
  }
}
