import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'app-control-panel',
  styleUrl: 'app-control-panel.css',
  scoped: true,
})
export class AppControlPanel {

  @Prop() renderHandler: () => any;

  render() {
    return (
      <Host>
        <ion-content>
          {
            this.renderHandler?.()
          }
        </ion-content>
      </Host>
    );
  }

}
