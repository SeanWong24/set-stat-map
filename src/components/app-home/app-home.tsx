import { Component, h, Host } from '@stencil/core';

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
          <s-parallel-sets
            style={{ width: '800px', height: '600px' }}
            ribbonTension={.5}
            onAxisHeaderContextMenu={({ detail }) => console.log(detail)}
            onAxisSegmentContextMenu={({ detail }) => console.log(detail)}
            onRibbonContextMenu={({ detail }) => console.log(detail)}
          ></s-parallel-sets>
        </ion-content>
      </Host>
    );
  }
}
