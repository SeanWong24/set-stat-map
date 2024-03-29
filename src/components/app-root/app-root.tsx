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
          <ion-route url="/demo" component="app-demo" />
          <ion-route url="/weather" component="app-weather-vis" />
          <ion-route url="/:visType" component="app-vis" />
          <ion-route url="/:visType/data-process" component="app-data-process" />
        </ion-router>
        <ion-nav />
      </ion-app>
    );
  }
}
