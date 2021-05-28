import { Component, Host, h, Prop, State, ComponentInterface } from '@stencil/core';

@Component({
  tag: 'app-multiple-select',
  styleUrl: 'app-multiple-select.css',
  shadow: true,
})
export class AppMultipleSelect implements ComponentInterface {

  @State() displayedOptions: string[] = [];

  @Prop() options: string[];
  @Prop() value: string[] = [];
  @Prop() cancelHandler: () => void;
  @Prop() valueChangeHandler: (value: string[]) => void;

  connectedCallback() {
    this.displayedOptions = this.options;
  }

  render() {
    const hasSelectedAll = JSON.stringify(this.displayedOptions.sort()) === JSON.stringify(this.value.sort());

    return (
      <Host>
        <ion-grid>
          <ion-row id="upper-row">
            <ion-searchbar
              animated
              onIonChange={({ detail }) => this.displayedOptions = detail.value ? this.options.filter(d => d.match(new RegExp(detail.value, 'i'))) : this.options}
            ></ion-searchbar>
          </ion-row>
          <ion-row id="middle-row">
            <ion-content>
              <ion-list>
                {
                  this.options?.map(option => (
                    <ion-item style={{ display: this.displayedOptions.indexOf(option) >= 0 ? '' : 'none' }}>
                      <ion-checkbox
                        slot="start"
                        checked={this.value.indexOf(option) >= 0}
                        onIonChange={({ detail }) => {
                          const index = this.value.indexOf(option);
                          if (detail.checked) {
                            if (index < 0) {
                              this.value = [...this.value, option];
                            }
                          } else {
                            if (index >= 0) {
                              this.value = this.value.splice(index, 1);
                            }
                          }
                        }}
                      ></ion-checkbox>
                      <ion-label>{option}</ion-label>
                    </ion-item>
                  ))
                }
              </ion-list>
            </ion-content>
          </ion-row>
          <ion-row id="lower-row">
            <ion-col size="auto">
              <ion-button fill="clear" onClick={() => {
                if (hasSelectedAll) {
                  this.value = [];
                } else {
                  this.value = this.displayedOptions;
                }
              }}>{hasSelectedAll ? 'Clear All' : 'Select All'}</ion-button>
            </ion-col>
            <ion-col></ion-col>
            <ion-col size="auto">
              <ion-button fill="clear" onClick={this.cancelHandler}>Cancel</ion-button>
            </ion-col>
            <ion-col size="auto">
              <ion-button fill="clear" onClick={() => this.valueChangeHandler(this.value)}>Confirm</ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </Host >
    );
  }

}
