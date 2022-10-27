import { Component, ComponentInterface, h, Host } from '@stencil/core';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css',
  scoped: true,
})
export class AppHome implements ComponentInterface {
  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Set-Stat-Map Demos</ion-title>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <ion-card>
            <ion-card-content>Please click one of below options for different demos of Set-Stat-Map. The demo requires a browser based on Chromium of version 86 or higher for the best compatibility.</ion-card-content>
          </ion-card>
          <ion-list>
            <ion-item button href="/weather">Weather</ion-item>
            <ion-item button href="/airbnb">AirBnb</ion-item>
            <ion-item button href="/stack-overflow">StackOverflow</ion-item>
          </ion-list>
        </ion-content>
      </Host>
    );
  }
}
