import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
})
export class AppRoot {
  render() {
    return (
      <ion-app>
        <ion-router useHash={true}>
          <ion-route url="/" component="app-home" />
          <ion-route url="/weather" component="app-weather-vis" />
          <ion-route url="/:datasetType/data-process" component="app-data-process" />
        </ion-router>
        <ion-nav />
      </ion-app>
    );
  }
}
