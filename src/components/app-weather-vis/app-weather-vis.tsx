import { loadingController } from '@ionic/core';
import { Component, Host, h, ComponentInterface, State } from '@stencil/core';
import initSqlJs from 'sql.js';
import { SqlJs } from 'sql.js/module';
import * as d3 from 'd3';

@Component({
  tag: 'app-weather-vis',
  styleUrl: 'app-weather-vis.css',
  scoped: true,
})
export class AppWeatherVis implements ComponentInterface {

  private readonly databaseName = 'weather';
  private readonly variableOptions: string[] = [
    "Elevation",
    "MaxTemperature",
    "MinTemperature",
    "Precipitation",
    "Wind",
    "RelativeHumidity",
    "Solar"
  ];
  private readonly colorScheme = [
    '#4575b4',
    '#abd9e9',
    '#fee090',
    '#f46d43'
  ];
  private readonly monthNumberAndNameDict = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec'
  };
  private readonly defineTexturesHandler: (textureGenerator: any) => (() => any)[] = (textureGenerator) => [
    () => textureGenerator.lines().stroke("transparent"),
    () => textureGenerator.circles().radius(2),
    () => textureGenerator.lines().orientation("2/8").size(10),
    () => textureGenerator.lines().orientation("2/8").size(10).heavier(),
    () => textureGenerator.lines().orientation("8/8").size(10),
    () => textureGenerator.lines().orientation("8/8").size(10).heavier(),
    () => textureGenerator.lines().orientation("6/8").size(10),
    () => textureGenerator.lines().orientation("6/8").size(10).heavier()
  ];

  private SQL: SqlJs.SqlJsStatic;
  private visRenderLoadingElement: HTMLIonLoadingElement;

  @State() file: File;
  @State() DB: SqlJs.Database;
  @State() categorizationMethod: 'quantile' | 'value' = 'quantile';
  @State() selectedVariables: string[];
  @State() data: any[];

  async connectedCallback() {
    this.SQL = await initSqlJs({ locateFile: fileName => `./assets/sql.js/${fileName}` });
    this.visRenderLoadingElement = await loadingController.create({
      message: `Rendering vis...`
    });
  }

  componentShouldUpdate(_newValue: any, _oldValue: any, propName: string) {
    const propertiesRequireQueryingData = ['DB', 'selectedVariables'];
    const shouldQueryData = propertiesRequireQueryingData.find(name => name === propName);
    const propertiesRequireReprocessingData = ['categorizationMethod'];
    const shouldReprocessData = propertiesRequireReprocessingData.find(name => name === propName);

    if (shouldQueryData) {
      this.updateData(true);
    } else if (shouldReprocessData) {
      this.updateData(false);
    }
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-buttons slot="start">
              <ion-back-button defaultHref="/"></ion-back-button>
            </ion-buttons>
            <ion-title>Weather Vis{` - ${this.file?.name || 'No File Opened'}`}</ion-title>
            <ion-buttons slot="end">
              <ion-button title="Open" onClick={() => this.openFile()}>
                <ion-icon slot="icon-only" name="open"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <ion-list>
            <ion-item disabled={!this.DB}>
              <ion-label>Categorization Method</ion-label>
              <ion-select
                value={this.categorizationMethod}
                onIonChange={({ detail }) => this.categorizationMethod = detail.value}
              >
                <ion-select-option value="quantile">By Quantile</ion-select-option>
                <ion-select-option value="value">By Value</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item disabled={!this.DB}>
              <ion-label>Variables</ion-label>
              <ion-select
                multiple
                value={this.selectedVariables}
                onIonChange={async ({ detail }) => this.selectedVariables = detail.value}
              >
                {
                  this.variableOptions.map(variable => (<ion-select-option>{variable}</ion-select-option>))
                }
              </ion-select>
            </ion-item>
          </ion-list>
          {
            this.data && this.selectedVariables?.length &&
            this.toggleVisRenderLoading(true) &&
            <div class="vis-container">
              <s-set-stat
                ref={() => this.toggleVisRenderLoading(false)}
                data={this.data}
                parallel-sets-ribbon-tension={.5}
                parallelSetsDimensions={this.selectedVariables.map(variableName => `_${variableName}`).concat('Date')}
                parallelSetsMaxAxisSegmentCount={12}
                colorScheme={this.colorScheme}
                defineTexturesHandler={this.defineTexturesHandler}
                statisticsColumnDefinitions={this.selectedVariables.map(variableName => ({
                  dimensionName: variableName,
                  visType: 'box'
                }))}
                dimensionDisplyedNameDict={
                  Object.fromEntries(this.selectedVariables.map(variableName => [`_${variableName}`, variableName]))
                }
                parallelSetsDimensionValueSortingMethods={{
                  '': (a, b) => +a.toString().split(' ~ ')[0] - +b.toString().split(' ~ ')[0],
                  'Date': undefined
                }}
              ></s-set-stat>
              <app-map-view></app-map-view>
            </div>
          }
        </ion-content>
      </Host>
    );
  }

  private async toggleVisRenderLoading(isEnabled: boolean) {
    if (isEnabled) {
      await this.visRenderLoadingElement.present();
    } else {
      await this.visRenderLoadingElement.dismiss();
    }
  }

  private async updateData(shouldQuery: boolean) {
    let data = this.data;
    if (shouldQuery) {
      data = await this.queryData();
    }
    data = await this.processData(data);
    this.data = data;
  }

  private async queryData() {
    if (this.DB && this.selectedVariables?.length > 0) {
      const loading = await loadingController.create({
        message: `Qeurying data...`
      });
      await loading.present();

      const sqlQueryString =
        `select substr(Date, 0, 8) as Date, Latitude, Longitude, ${this.selectedVariables.map(variable => `avg(${variable}) as ${variable}`).join(', ')} ` +
        `from ${this.databaseName} ` +
        `group by substr(Date, 0, 8), Latitude, Longitude`;
      const result = this.DB.exec(sqlQueryString)?.[0];

      const data = result?.values.map(value => {
        const datum = {};
        for (let i = 0; i < value.length; i++) {
          datum[result.columns[i]] = (result.columns[i] === 'Date') ? this.monthNumberAndNameDict[value[i].toString().substring(5)] : +value[i];
        }
        return datum;
      });

      await loading.dismiss();

      return data;
    }
  }

  private async processData(data: any[]) {
    const loading = await loadingController.create({
      message: `Processing data...`
    });
    await loading.present();

    if (data) {
      switch (this.categorizationMethod) {
        case 'quantile':
          const variableNameAndQuantileScaleDict: { [variableName: string]: d3.ScaleQuantile<number, never> } = {};
          const variableNameAndCategorizedValuesDict: { [variableName: string]: string[] } = {};
          this.selectedVariables.forEach(variableName => variableNameAndQuantileScaleDict[variableName] = d3.scaleQuantile().domain(data.map(d => d[variableName])).range([0, 1, 2, 3]));
          this.selectedVariables.forEach(variableName => {
            const quantiles = variableNameAndQuantileScaleDict[variableName].quantiles();
            const variableValues = data.map(d => d[variableName]);
            const variableMinValue = d3.min(variableValues);
            const variableMaxValue = d3.max(variableValues);
            variableNameAndCategorizedValuesDict[variableName] = [
              `${variableMinValue.toFixed(2)} ~ ${(+quantiles[0]).toFixed(2)}`,
              `${(+quantiles[0]).toFixed(2)} ~ ${(+quantiles[1]).toFixed(2)}`,
              `${(+quantiles[1]).toFixed(2)} ~ ${(+quantiles[2]).toFixed(2)}`,
              `${(+quantiles[2]).toFixed(2)} ~ ${variableMaxValue.toFixed(2)}`
            ];
          });
          for (const dataRecord of data) {
            for (const variableName of this.selectedVariables) {
              const quantileValue = variableNameAndQuantileScaleDict[variableName](dataRecord[variableName]);
              dataRecord[`_${variableName}`] = variableNameAndCategorizedValuesDict[variableName][quantileValue];
            }
          }
          break;
        case 'value':
          break;
      }
    }

    await loading.dismiss();

    return data;
  }

  private async openFile() {
    const [fileHandle] = await (window as any).showOpenFilePicker();
    const file = await fileHandle.getFile() as File;

    const loading = await loadingController.create({
      message: `Opening ${file.name}...`
    });
    await loading.present();
    const fileBuffer = await file.arrayBuffer();
    this.file = file;
    this.DB = new this.SQL.Database(new Uint8Array(fileBuffer));
    this.resetVisStates();

    await loading.dismiss();
  }

  private resetVisStates() {
    this.data = undefined;
    this.categorizationMethod = 'quantile';
    this.selectedVariables = undefined;
  }

}
