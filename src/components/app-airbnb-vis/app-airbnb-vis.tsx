import { alertController, loadingController, modalController } from '@ionic/core';
import { Component, Host, h, ComponentInterface, State, Event, EventEmitter, Prop, Watch } from '@stencil/core';
import initSqlJs from 'sql.js';
import { SqlJs } from 'sql.js/module';
import * as d3 from 'd3';
import { AppVisComponent } from '../../global/utilts';
import { ParallelSetsOnLoadDetail } from '../s-parallel-sets/utils';

@Component({
  tag: 'app-airbnb-vis',
  styleUrl: 'app-airbnb-vis.css',
  shadow: true,
})
export class AppAirbnbVis implements ComponentInterface, AppVisComponent {
  private SQL: SqlJs.SqlJsStatic;
  private DB: SqlJs.Database;
  private loadingElement: HTMLIonLoadingElement;
  private setStatOnLoadDetail: ParallelSetsOnLoadDetail;
  private parallelSetsLastAxisSortBy: { dimensionName?: string; orderBy?: 'ascending' | 'descending' };

  private readonly categoricalVariableOptions: string[] = [
    'room_id',
    'host_id',
    'room_type',
    'borough',
    'neighborhood',
    'bedrooms',
    '_reviews',
    '_overall_satisfaction',
    '_accommodates',
    '_price',
  ];

  private readonly numericalVariableOptions: string[] = ['reviews', 'overall_satisfaction', 'accommodates', 'bedrooms', 'price'];

  private readonly colorScheme = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff', '#f7ede2', '#f5cac3', '#84a59d'];

  private readonly defineTexturesHandler: (textureGenerator: any) => (() => any)[] = textureGenerator => [
    () => textureGenerator.circles().size(5).fill(`rgba(0,0,0,.25)`),
    () => textureGenerator.circles().size(5).fill(`rgba(0,0,0,.5)`),
    () => textureGenerator.circles().size(5).fill(`rgba(0,0,0,.75)`),
    () => textureGenerator.circles().size(5).fill(`rgba(0,0,0,.1)`),
    () => textureGenerator.lines().stroke('transparent'),
  ];

  @State() dateOptions: string[] = [];
  @State() data: any[];
  @State() statisticsColumnsHeaderTextColor:
    | string
    | {
        [dimensionName: string]: string;
      };

  @State() selectedParallelSetsVariables: string[] = [];

  @Watch('selectedParallelSetsVariables')
  async selectedParallelSetsVariablesWatchHandler() {
    await this.queryData();
  }

  @State() selectedStatisticsColumnsVariables: string[] = [];

  @Watch('selectedStatisticsColumnsVariables')
  async selectedStatisticsColumnsVariablesWatchHandler() {
    await this.queryData();
  }

  @State() selectedDate: string;

  @Watch('selectedDate')
  async selectedDateWatchHandler() {
    await this.queryData();
  }

  @State() categorizationMethod: 'quantile' | 'uniform' = 'uniform';
  @Watch('categorizationMethod')
  async categorizationMethodWatchHandler() {
    await this.queryData();
  }

  @State() mapRange: {
    minLatitude: number;
    maxLatitude: number;
    minLongitude: number;
    maxLongitude: number;
  };
  @State() dimensionMaxTextLength: number = 10;

  @Prop() file: File;
  @Watch('file')
  async fileWatchHandler(file: File) {
    await this.loadDB(file);
  }

  @State() mapViewHeatmapData: {
    colorLegendTitle: string;
    colorLegendDefinitions: { value: string; color: string }[];
    textureLegendTitle: string;
    textureLegendDefinitions: { value: string; textureGenerator: any }[];
    primaryValueTitle: string;
    secondaryValueHeader: string;
    isTooltipEnabled: boolean;
    dataPoints: {
      latitude: number;
      longitude: number;
      primaryValue: string | number;
      color: string;
      secondaryValue: string | number;
      textureGenerator: any;
      radius: number;
    }[];
  };

  @Event() controlPanelRenderHandlerUpdated: EventEmitter<() => any>;

  async connectedCallback() {
    this.SQL = await initSqlJs({ locateFile: fileName => `./assets/sql.js/${fileName}` });
    this.loadingElement = await loadingController.create({});
  }

  componentWillRender() {
    this.controlPanelRenderHandlerUpdated.emit(() => this.renderControlPanel());
  }

  render() {
    return (
      <Host>
        <ion-card class="vis-container">
          <s-set-stat
            onVisLoad={({ detail }) => {
              this.setStatOnLoadDetail = detail;
              setTimeout(() => {
                this.mapViewHeatmapData = {
                  dataPoints:
                    this.data?.map(d => {
                      let primaryValue = d[this.selectedParallelSetsVariables?.[0]];
                      if (!this.setStatOnLoadDetail.valuesDict[this.selectedParallelSetsVariables?.[0]].includes(primaryValue)) {
                        primaryValue = '*Other*';
                      }
                      let secondaryValue = d[this.selectedParallelSetsVariables?.[1]];
                      if (!this.setStatOnLoadDetail.valuesDict[this.selectedParallelSetsVariables?.[1]].includes(secondaryValue)) {
                        secondaryValue = '*Other*';
                      }
                      return {
                        latitude: +d.latitude,
                        longitude: +d.longitude,
                        primaryValue,
                        color: this.setStatOnLoadDetail?.colorDict?.[primaryValue],
                        secondaryValue,
                        textureGenerator: this.setStatOnLoadDetail?.textureGeneratorDict?.[secondaryValue],
                        radius: 5,
                      };
                    }) || [],
                  colorLegendTitle: this.selectedParallelSetsVariables?.[0],
                  colorLegendDefinitions: Object.entries(this.setStatOnLoadDetail?.colorDict || {}).map(([value, color]) => ({ value, color })),
                  textureLegendTitle: this.selectedParallelSetsVariables?.[1],
                  textureLegendDefinitions: Object.entries(this.setStatOnLoadDetail?.textureGeneratorDict || {}).map(([value, textureGenerator]) => ({ value, textureGenerator })),
                  primaryValueTitle: this.selectedParallelSetsVariables?.[0],
                  secondaryValueHeader: this.selectedParallelSetsVariables?.[1],
                  isTooltipEnabled: true,
                };
              });
            }}
            data={this.data}
            parallelSetsMaxAxisSegmentCount={5}
            defineTexturesHandler={this.defineTexturesHandler}
            parallelSetsDimensions={this.selectedParallelSetsVariables}
            colorScheme={this.colorScheme}
            parallelSetsAutoMergedAxisSegmentMaxRatio={0.1}
            parallelSetsRibbonTension={0.5}
            statisticsColumnDefinitions={this.selectedStatisticsColumnsVariables?.map(variable => ({
              dimensionName: variable,
              visType: 'box',
            }))}
            // parallelSetsDimensionValueSortingMethods={{
            //   '': (a: string, b: string) => a.localeCompare(b),
            // }}
            statisticsColumnsHeaderTextColor={this.statisticsColumnsHeaderTextColor}
            onStatisticsColumnsHeaderClick={async ({ detail: dimensionName, currentTarget }) => {
              if (this.parallelSetsLastAxisSortBy?.dimensionName === dimensionName && this.parallelSetsLastAxisSortBy?.orderBy === 'ascending') {
                this.parallelSetsLastAxisSortBy = { dimensionName, orderBy: 'descending' };
                const headerTextColor = {};
                headerTextColor[''] = 'black';
                headerTextColor[dimensionName] = 'blue';
                this.statisticsColumnsHeaderTextColor = headerTextColor;
              } else if (this.parallelSetsLastAxisSortBy?.dimensionName === dimensionName && this.parallelSetsLastAxisSortBy?.orderBy === 'descending') {
                this.parallelSetsLastAxisSortBy = undefined;
                this.statisticsColumnsHeaderTextColor = 'black';
              } else {
                this.parallelSetsLastAxisSortBy = { dimensionName, orderBy: 'ascending' };
                const headerTextColor = {};
                headerTextColor[''] = 'black';
                headerTextColor[dimensionName] = 'red';
                this.statisticsColumnsHeaderTextColor = headerTextColor;
              }
              await (currentTarget as HTMLSSetStatElement)?.reorderParallelSetsLastAxisByDimension(
                this.parallelSetsLastAxisSortBy?.dimensionName,
                this.parallelSetsLastAxisSortBy?.orderBy,
              );
            }}
            parallelSetsHeaderTextMaxLetterCount={this.dimensionMaxTextLength}
            statisticsColumnsHeaderTextMaxLetterCount={this.dimensionMaxTextLength}
          ></s-set-stat>
          <app-map-view
            centerPoint={[51.03229, -114.068613]}
            datasetRange={this.mapRange}
            zoom={11}
            onMouseDraw={({ detail }) => (this.mapRange = detail)}
            heatmapData={this.mapViewHeatmapData}
          ></app-map-view>
        </ion-card>
      </Host>
    );
  }

  private renderControlPanel() {
    return (
      <ion-list>
        <ion-item>
          <ion-label>Max Header Text Length</ion-label>
          <ion-input
            type="number"
            value={this.dimensionMaxTextLength}
            onIonChange={({ detail }) => (this.dimensionMaxTextLength = detail.value === '' ? undefined : +detail.value)}
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label>Category</ion-label>
          <ion-select value={this.categorizationMethod} onIonChange={({ detail }) => (this.categorizationMethod = detail.value)}>
            <ion-select-option value="quantile">Quantile</ion-select-option>
            <ion-select-option value="uniform">Uniform</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item
          button
          disabled={!this.dateOptions}
          onClick={async () => {
            const modal = await modalController.create({
              component: 'app-multiple-select',
              componentProps: {
                options: this.categoricalVariableOptions,
                value: this.selectedParallelSetsVariables,
                valueChangeHandler: async value => {
                  this.selectedParallelSetsVariables = value;
                  await modal.dismiss();
                },
                cancelHandler: async () => await modal.dismiss(),
              },
            });
            await modal.present();
          }}
        >
          <ion-label>Select PS Variables</ion-label>
          <ion-badge>{this.selectedParallelSetsVariables?.length ?? 0}</ion-badge>
        </ion-item>
        <ion-item>
          <ion-label>Oder By</ion-label>
          <ion-reorder-group
            disabled={false}
            onIonItemReorder={({ detail }) => {
              const variables = [...this.selectedParallelSetsVariables];
              detail.complete(variables);
              this.selectedParallelSetsVariables = variables;
            }}
          >
            {this.selectedParallelSetsVariables?.map(variable => (
              <ion-item>
                <ion-label>{variable}</ion-label>
                <ion-reorder slot="start"></ion-reorder>
              </ion-item>
            ))}
          </ion-reorder-group>
        </ion-item>
        <ion-item
          button
          disabled={!this.dateOptions}
          onClick={async () => {
            const modal = await modalController.create({
              component: 'app-multiple-select',
              componentProps: {
                options: this.numericalVariableOptions,
                value: this.selectedStatisticsColumnsVariables,
                valueChangeHandler: async value => {
                  this.selectedStatisticsColumnsVariables = value;
                  await modal.dismiss();
                },
                cancelHandler: async () => await modal.dismiss(),
              },
            });
            await modal.present();
          }}
        >
          <ion-label>Select SC Variables</ion-label>
          <ion-badge>{this.selectedStatisticsColumnsVariables?.length ?? 0}</ion-badge>
        </ion-item>
        <ion-item>
          <ion-label>Oder By</ion-label>
          <ion-reorder-group
            onIonItemReorder={({ detail }) => {
              const variables = [...this.selectedStatisticsColumnsVariables];
              detail.complete(variables);
              this.selectedStatisticsColumnsVariables = variables;
            }}
          >
            {this.selectedStatisticsColumnsVariables?.map(variable => (
              <ion-item>
                <ion-label>{variable}</ion-label>
                <ion-reorder slot="start"></ion-reorder>
              </ion-item>
            ))}
          </ion-reorder-group>
        </ion-item>
        <ion-item>
          <ion-label>Date</ion-label>
          <ion-select
            onIonChange={({ detail }) => {
              this.selectedDate = detail.value;
            }}
          >
            {this.dateOptions?.map(date => (
              <ion-select-option>{date}</ion-select-option>
            ))}
          </ion-select>
        </ion-item>
      </ion-list>
    );
  }

  private async loadDB(file: File) {
    try {
      this.loadingElement.message = `Loading ${file.name}...`;
      await this.loadingElement.present();
      const fileBuffer = await file.arrayBuffer();
      const DB = new this.SQL.Database(new Uint8Array(fileBuffer));
      await this.loadingElement.dismiss();
      if (DB) {
        this.DB = DB;
        this.dateOptions = await this.obtainDateOptions();
      } else {
        this.alertInvalidDatabase();
      }
    } catch {}
  }

  private async obtainDateOptions() {
    const sqlQuery = 'select distinct substr(last_modified, 0, 11) from arbnb';
    const result = this.DB.exec(sqlQuery)?.[0];
    return result.values.map(d => d[0].toString());
  }

  private async queryData() {
    if (this.DB && this.dateOptions && this.selectedParallelSetsVariables?.length > 0 && this.selectedStatisticsColumnsVariables?.length > 0 && this.selectedDate) {
      const loading = await loadingController.create({
        message: `Qeurying data...`,
      });
      await loading.present();

      const selectedVariables = this.selectedParallelSetsVariables
        .concat(this.selectedStatisticsColumnsVariables)
        .filter((d, i, a) => a.indexOf(d) === i)
        .map(d => (d.startsWith('_') ? d.slice(1) : d));
      selectedVariables.push('latitude');
      selectedVariables.push('longitude');

      let sqlQuery = `select ${selectedVariables.join(', ')} from arbnb where substr(last_modified, 0, 11) = '${this.selectedDate}'`;
      if (this.mapRange) {
        sqlQuery += ` and latitude >= ${this.mapRange.minLatitude} and latitude <= ${this.mapRange.maxLatitude} and longitude >= ${this.mapRange.minLongitude} and longitude <= ${this.mapRange.maxLongitude}`;
      }
      const result = this.DB.exec(sqlQuery)?.[0];
      const data = result?.values.map(value => {
        const datum = {};
        for (let i = 0; i < value.length; i++) {
          if (this.numericalVariableOptions.find(d => d === result.columns[i])) {
            datum[result.columns[i]] = isNaN(+value[i]) ? 0 : +value[i];
          } else {
            datum[result.columns[i]] = value[i];
          }
        }
        return datum;
      });
      this.data = await this.processData(data);

      await loading.dismiss();
    }
  }

  private async processData(data: any[]) {
    if (data) {
      const categorizedValueMap = new Map();
      const variables = this.selectedParallelSetsVariables.filter(d => d[0] === '_').map(d => d.substring(1));
      if (this.categorizationMethod === 'quantile') {
        const quantileScaleDict = {};
        variables.forEach(
          variable =>
            (quantileScaleDict[variable] = d3
              .scaleQuantile()
              .domain(data.map(d => d[variable]).sort())
              .range([0.25, 0.5, 0.75, 1])),
        );
        variables.forEach(variable => {
          const quantiles = quantileScaleDict[variable].quantiles();
          const variableValues = data.map(d => d[variable]);
          const variableMinValue = d3.min(variableValues);
          const variableMaxValue = d3.max(variableValues);
          categorizedValueMap.set(variable, [
            `${variableMinValue.toFixed(2)} ~ ${(+quantiles[0]).toFixed(2)}`,
            `${(+quantiles[0]).toFixed(2)} ~ ${(+quantiles[1]).toFixed(2)}`,
            `${(+quantiles[1]).toFixed(2)} ~ ${(+quantiles[2]).toFixed(2)}`,
            `${(+quantiles[2]).toFixed(2)} ~ ${variableMaxValue.toFixed(2)}`,
          ]);
        });
        const obtainQuantileValueRange = (variable, quantileValue) => {
          switch (quantileValue) {
            case 0.25:
              return categorizedValueMap.get(variable)[0];
            case 0.5:
              return categorizedValueMap.get(variable)[1];
            case 0.75:
              return categorizedValueMap.get(variable)[2];
            case 1:
              return categorizedValueMap.get(variable)[3];
          }
        };
        data.forEach(d => variables.forEach(variable => (d[`_${variable}`] = obtainQuantileValueRange(variable, quantileScaleDict[variable](d[variable])))));
        variables.forEach(variable => {
          categorizedValueMap.set(
            variable,
            categorizedValueMap.get(variable).filter(v => data.filter(d => d[`_${variable}`] === v).length > 0),
          );
        });
      } else if (this.categorizationMethod === 'uniform') {
        const valueScaleDict = {};
        const valueThresholdDict = {};
        variables.forEach(variable => {
          const values = data.map(d => d[variable]);
          const minValue = d3.min(values);
          const maxValue = d3.max(values);
          const thresholds = [minValue, minValue + (maxValue - minValue) * 0.25, minValue + (maxValue - minValue) * 0.5, minValue + (maxValue - minValue) * 0.75, maxValue];
          valueThresholdDict[variable] = thresholds.map(d => d.toFixed(2));
          valueScaleDict[variable] = d3.scaleThreshold().domain(thresholds).range([0, 1, 2, 3]);
          categorizedValueMap.set(variable, [
            `${thresholds[0].toFixed(2)} ~ ${thresholds[1].toFixed(2)}`,
            `${thresholds[1].toFixed(2)} ~ ${thresholds[2].toFixed(2)}`,
            `${thresholds[2].toFixed(2)} ~ ${thresholds[3].toFixed(2)}`,
            `${thresholds[3].toFixed(2)} ~ ${thresholds[4].toFixed(2)}`,
          ]);
        });
        data.forEach(d => variables.forEach(variable => (d[`_${variable}`] = categorizedValueMap.get(variable)[valueScaleDict[variable](d[variable])])));
        variables.forEach(variable => {
          categorizedValueMap.set(
            variable,
            categorizedValueMap.get(variable).filter(v => data.filter(d => d[`_${variable}`] === v).length > 0),
          );
        });
      }
    }
    return data;
  }

  private async alertInvalidDatabase() {
    const alert = await alertController.create({
      header: 'Invalid Database File',
      message: 'The database file opened seems to be invalid, please check the file and try again.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}
