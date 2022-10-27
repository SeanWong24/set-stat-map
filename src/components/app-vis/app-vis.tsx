import { Component, Host, h, State, Prop, ComponentInterface } from '@stencil/core';
import { visRouteAndDisplayNameDict } from '../../global/utilts';

@Component({
  tag: 'app-vis',
  styleUrl: 'app-vis.css',
  scoped: true,
})
export class AppVis implements ComponentInterface {
  private get visTypeDisplayName() {
    return visRouteAndDisplayNameDict[this.visType];
  }

  @State() file: File;
  @State() data: any[];
  @State() visControlPanelRenderHandler: () => any;

  @Prop() visType: string;

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-buttons slot="start">
              <ion-back-button defaultHref="/"></ion-back-button>
            </ion-buttons>
            <ion-title>{`${this.visTypeDisplayName} Vis - ${this.file?.name || 'No File Opened'}`}</ion-title>
            <ion-buttons slot="end">
              {this.visType === 'stack-overflow' && (
                <ion-button title="Generate Database File" href="/stack-overflow/data-process">
                  <ion-icon slot="icon-only" name="construct"></ion-icon>
                </ion-button>
              )}
              <ion-button title="Open Database File" onClick={() => this.openFile()}>
                <ion-icon slot="icon-only" name="open"></ion-icon>
              </ion-button>
              <ion-menu-toggle>
                <ion-button>
                  <ion-icon slot="icon-only" name="options"></ion-icon>
                </ion-button>
              </ion-menu-toggle>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-split-pane when="(min-width: 1600px)" content-id="main-container">
          <ion-menu side="end" content-id="main-container">
            <app-control-panel renderHandler={this.visControlPanelRenderHandler}></app-control-panel>
          </ion-menu>
          <ion-content id="main-container" class="ion-padding" scrollY={false}>
            {this.renderVis()}
          </ion-content>
        </ion-split-pane>
      </Host>
    );
  }

  private async openFile() {
    const [fileHandle] = await (window as any).showOpenFilePicker();
    const file = (await fileHandle.getFile()) as File;
    this.file = file;
  }

  private renderVis() {
    switch (this.visType) {
      case 'airbnb':
        return <app-airbnb-vis onControlPanelRenderHandlerUpdated={({ detail }) => (this.visControlPanelRenderHandler = detail)} file={this.file}></app-airbnb-vis>;
      case 'stack-overflow':
        return <app-stack-overflow-vis onControlPanelRenderHandlerUpdated={({ detail }) => (this.visControlPanelRenderHandler = detail)} file={this.file}></app-stack-overflow-vis>;
    }
  }
}
