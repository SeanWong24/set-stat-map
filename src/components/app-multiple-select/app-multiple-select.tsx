import { Component, Host, h, Prop, State, ComponentInterface, Watch } from '@stencil/core';

@Component({
  tag: 'app-multiple-select',
  styleUrl: 'app-multiple-select.css',
  shadow: true,
})
export class AppMultipleSelect implements ComponentInterface {

  @State() displayLimitCount = 20;
  @State() helperOptions: { name: string, isSelected: boolean, shouldDisplay: boolean }[] = [];

  @Prop() cancelHandler: () => void;
  @Prop() valueChangeHandler: (value: string[]) => void;

  @Prop() options: string[];
  @Watch('options')
  optionsWatchHAndler() {
    this.generateHelperOptions();
  }

  @Prop() value: string[] = [];
  @Watch('value')
  valueWatchHAndler() {
    this.generateHelperOptions();
  }

  componentWillLoad() {
    this.generateHelperOptions();
  }

  render() {
    const hasSelectedSomething = this.helperOptions?.filter(d => d.isSelected).length > 0;

    return (
      <Host>
        <ion-grid>
          <ion-row id="upper-row">
            <ion-searchbar
              animated
              onIonChange={({ detail }) => {
                const helperOptions = this.helperOptions;
                this.helperOptions = [];
                setTimeout(() => {
                  this.helperOptions = helperOptions.map(d => ({
                    name: d.name,
                    isSelected: d.isSelected,
                    shouldDisplay: !!d.name.match(new RegExp(detail.value, 'i'))
                  }));
                  this.displayLimitCount = 20;
                });
              }}
            ></ion-searchbar>
          </ion-row>
          <ion-row id="middle-row">
            <ion-content>
              <ion-list>
                {
                  this.helperOptions
                    ?.filter(d => d.shouldDisplay)
                    ?.slice(0, this.displayLimitCount)
                    ?.map(option => (
                      <ion-item>
                        <ion-checkbox
                          slot="start"
                          checked={option.isSelected}
                          onIonChange={({ detail }) => {
                            option.isSelected = detail.checked;
                          }}
                        ></ion-checkbox>
                        <ion-label>{option.name}</ion-label>
                      </ion-item>
                    ))
                }
              </ion-list>
              <ion-infinite-scroll
                onIonInfinite={event => {
                  this.displayLimitCount += 20;
                  (event.target as HTMLIonInfiniteScrollElement).complete();
                }}
              >
                <ion-infinite-scroll-content
                  loadingSpinner="bubbles"
                  loadingText="Loading more..."
                ></ion-infinite-scroll-content>
              </ion-infinite-scroll>
            </ion-content>
          </ion-row>
          <ion-row id="lower-row">
            <ion-col size="auto">
              <ion-button fill="clear" onClick={() => {
                if (hasSelectedSomething) {
                  this.helperOptions = this.helperOptions.map(d => ({
                    name: d.name,
                    isSelected: false,
                    shouldDisplay: d.shouldDisplay
                  }));
                } else {
                  this.helperOptions = this.helperOptions.map(d => ({
                    name: d.name,
                    isSelected: true,
                    shouldDisplay: d.shouldDisplay
                  }));
                }
              }}>{hasSelectedSomething ? 'Clear All' : 'Select All'}</ion-button>
            </ion-col>
            <ion-col></ion-col>
            <ion-col size="auto">
              <ion-button fill="clear" onClick={this.cancelHandler}>Cancel</ion-button>
            </ion-col>
            <ion-col size="auto">
              <ion-button fill="clear" onClick={() => this.valueChangeHandler(this.helperOptions?.filter(d => d.isSelected).map(d => d.name))}>Confirm</ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </Host >
    );
  }

  private generateHelperOptions() {
    this.helperOptions = this.options?.map(option => ({
      name: option,
      isSelected: this.value?.indexOf(option) >= 0,
      shouldDisplay: true
    }));
  }

}
