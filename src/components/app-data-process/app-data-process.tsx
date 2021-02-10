import { Component, Host, h, ComponentInterface, Prop } from '@stencil/core';
import { visRouteAndDisplayNameDict } from '../../global/utilts';

@Component({
  tag: 'app-data-process',
  styleUrl: 'app-data-process.css',
  scoped: true,
})
export class AppDataProcess implements ComponentInterface {

  @Prop() visType: string;

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-buttons slot="start">
              <ion-back-button defaultHref={`/${this.visType}`}></ion-back-button>
            </ion-buttons>
            <ion-title>Data Process {this.visType && `for ${visRouteAndDisplayNameDict[this.visType]}`}</ion-title>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          {this.getContent()}
        </ion-content>
      </Host>
    );
  }

  private getContent() {
    switch (this.visType) {
      case 'weather':
        return <app-weather-data-process></app-weather-data-process>;
      default:
        return <ion-content class="ion-padding">Nothing yet</ion-content>;
    }
  }

}
