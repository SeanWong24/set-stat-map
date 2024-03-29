import { alertController, loadingController, modalController } from '@ionic/core';
import { Component, Host, h, ComponentInterface, Prop, Watch, State, Event, EventEmitter } from '@stencil/core';
import initSqlJs from 'sql.js';
import { SqlJs } from 'sql.js/module';
import * as d3 from 'd3';
import { AppVisComponent } from '../../global/utilts';
import { StatisticsColumnsVisType } from '../s-statistics-columns/utils';

@Component({
  tag: 'app-stack-overflow-vis',
  styleUrl: 'app-stack-overflow-vis.css',
  scoped: true,
})
export class AppStackOverflowVis implements ComponentInterface, AppVisComponent {
  private SQL: SqlJs.SqlJsStatic;
  private DB: SqlJs.Database;
  private loadingElement: HTMLIonLoadingElement;

  private readonly defineTexturesHandler: (textureGenerator: any) => (() => any)[] = textureGenerator => [
    () => textureGenerator.lines().orientation('0/8').size(10),
    () => textureGenerator.lines().orientation('2/8').size(10),
    () => textureGenerator.lines().orientation('6/8').size(10),
    () => textureGenerator.lines().orientation('8/8').size(10),
    () => textureGenerator.lines().stroke('transparent'),
  ];

  @State() data: any[];
  @State() datasetInfo: { techs: string[]; locations: string[]; years: string[] };
  @State() statisticsColumnDefinitions: {
    dimensionName: string;
    visType: StatisticsColumnsVisType;
  }[] = [];
  @State() orderedTechs: string[];
  @State() dimensionMaxTextLength: number = 10;

  @State() statisticsColumnsOption: 'active-years' | 'tech-count' | 'tech-count-all' = 'active-years';
  @Watch('statisticsColumnsOption')
  async statisticsColumnsOptionWatchHandler() {
    await this.queryData();
  }

  @State() isActiveYearsSegmentsEnabled: boolean = true;
  @Watch('isActiveYearsSegmentsEnabled')
  async isActiveYearsSegmentsEnabledWatchHandler() {
    await this.queryData();
  }

  @State() selectedTechs: string[] = [];
  @Watch('selectedTechs')
  async selectedTechsWatchHandler(selectedTechs: string[]) {
    await this.queryData();
    this.orderedTechs = [...selectedTechs];
    this.statisticsColumnDefinitions = selectedTechs.map(selectedTech => ({
      dimensionName: selectedTech,
      visType: 'box',
    }));
  }

  @State() selectedLocations: string[] = [];
  @Watch('selectedLocations')
  async selectedLocationsWatchHandler() {
    await this.queryData();
  }

  @State() selectedYears: string[] = [];
  @Watch('selectedYears')
  async selectedYearsWatchHandler() {
    await this.queryData();
  }

  @Prop() file: File;
  @Watch('file')
  async fileWatchHandler(file: File) {
    await this.loadDB(file);
  }

  @Event() controlPanelRenderHandlerUpdated: EventEmitter<() => any>;

  async connectedCallback() {
    this.SQL = await initSqlJs({ locateFile: fileName => `./assets/sql.js/${fileName}` });
    this.loadingElement = await loadingController.create({});
  }

  componentWillRender() {
    this.controlPanelRenderHandlerUpdated.emit(() => this.renderControlPanel());
  }

  render() {
    const heatmapData = this.generateHeatmapData();

    return (
      <Host>
        <ion-card class="vis-container">
          <s-set-stat
            data={this.data}
            parallelSetsMaxAxisSegmentCount={{
              Location: 8,
              Tech: 5,
            }}
            defineTexturesHandler={this.defineTexturesHandler}
            parallelSetsDimensions={['Location', 'Tech', 'Year']}
            colorScheme={['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff', '#f7ede2', '#f5cac3', '#84a59d']}
            parallelSetsAutoMergedAxisSegmentMaxRatio={0.1}
            parallelSetsRibbonTension={0.5}
            statisticsColumnDefinitions={this.statisticsColumnDefinitions}
            parallelSetsDimensionValueSortingMethods={{
              Tech: (a, b) => (this.orderedTechs ? this.orderedTechs.indexOf(a.toString()) - this.orderedTechs.indexOf(b.toString()) : 0),
              Year: (a, b) => +a - +b,
              Location: (a, b) => this.data.filter(d => d['Location'] === b).length - this.data.filter(d => d['Location'] === a).length,
            }}
            parallelSetsHeaderTextMaxLetterCount={this.dimensionMaxTextLength}
            statisticsColumnsHeaderTextMaxLetterCount={this.dimensionMaxTextLength}
          ></s-set-stat>
          <app-heatmap-view
            header="Year/Tech"
            data={heatmapData?.data}
            xLabels={heatmapData?.xLabels}
            yLabels={heatmapData?.yLabels}
            labelMaxLetterCount={this.dimensionMaxTextLength}
          ></app-heatmap-view>
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
          <ion-label>Avtive Years Segments</ion-label>
          <ion-toggle checked={this.isActiveYearsSegmentsEnabled} onIonChange={() => (this.isActiveYearsSegmentsEnabled = !this.isActiveYearsSegmentsEnabled)}></ion-toggle>
        </ion-item>
        <ion-item
          button
          disabled={!this.datasetInfo?.techs}
          onClick={async () => {
            const modal = await modalController.create({
              component: 'app-multiple-select',
              componentProps: {
                options: this.datasetInfo?.techs,
                value: this.selectedTechs,
                valueChangeHandler: async value => {
                  this.selectedTechs = value;
                  await modal.dismiss();
                },
                cancelHandler: async () => await modal.dismiss(),
              },
            });
            await modal.present();
          }}
        >
          <ion-label>Select Techs</ion-label>
          <ion-badge>{this.selectedTechs?.length || 0}</ion-badge>
        </ion-item>
        <ion-item
          button
          disabled={!this.datasetInfo?.locations}
          onClick={async () => {
            const modal = await modalController.create({
              component: 'app-multiple-select',
              componentProps: {
                options: this.datasetInfo?.locations,
                value: this.selectedLocations,
                valueChangeHandler: async value => {
                  this.selectedLocations = value;
                  await modal.dismiss();
                },
                cancelHandler: async () => await modal.dismiss(),
              },
            });
            await modal.present();
          }}
        >
          <ion-label>Select Countries</ion-label>
          <ion-badge>{this.selectedLocations?.length || 0}</ion-badge>
        </ion-item>
        <ion-item
          button
          disabled={!this.datasetInfo?.years}
          onClick={async () => {
            const modal = await modalController.create({
              component: 'app-multiple-select',
              componentProps: {
                options: this.datasetInfo?.years,
                value: this.selectedYears,
                valueChangeHandler: async value => {
                  this.selectedYears = value;
                  await modal.dismiss();
                },
                cancelHandler: async () => await modal.dismiss(),
              },
            });
            await modal.present();
          }}
        >
          <ion-label>Select Years</ion-label>
          <ion-badge>{this.selectedYears?.length || 0}</ion-badge>
        </ion-item>
        <ion-item disabled={!this.datasetInfo?.techs}>
          <ion-label>Stat Columns Option</ion-label>
          <ion-select value={this.statisticsColumnsOption} onIonChange={({ detail }) => (this.statisticsColumnsOption = detail.value)}>
            {['active-years', 'tech-count', 'tech-count-all'].map(option => (
              <ion-select-option value={option}>{option}</ion-select-option>
            ))}
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label class="control-panel-item-label">Order By</ion-label>
          <ion-content style={{ height: '150px', minWidth: '250px' }}>
            <ion-reorder-group
              disabled={false}
              onIonItemReorder={({ detail }) => {
                const orderedTechs = [...this.orderedTechs];
                detail.complete(orderedTechs);
                this.orderedTechs = orderedTechs;
              }}
            >
              {this.orderedTechs?.map(tech => (
                <ion-item>
                  <ion-label>{tech}</ion-label>
                  <ion-reorder slot="start"></ion-reorder>
                </ion-item>
              ))}
            </ion-reorder-group>
          </ion-content>
        </ion-item>
        <ion-button
          expand="block"
          onClick={() => (this.orderedTechs = [...this.orderedTechs.sort((a, b) => this.data.filter(d => d['Tech'] === b).length - this.data.filter(d => d['Tech'] === a).length)])}
        >
          Sort Tech by Popularity
        </ion-button>
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
        this.datasetInfo = await this.obtainDatasetInfo();
      } else {
        this.alertInvalidDatabase();
      }
    } catch {}
  }

  private async alertInvalidDatabase() {
    const alert = await alertController.create({
      header: 'Invalid Database File',
      message: 'The database file opened seems to be invalid, please check the file and try again.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  private async obtainDatasetInfo() {
    if (this.DB) {
      const loading = await loadingController.create({
        message: `Obtaining dataset info...`,
      });
      await loading.present();

      let sqlQueryString = 'select distinct Tech from stackoverflow';
      let result = this.DB.exec(sqlQueryString)?.[0];
      const techs = result.values.map(value => value.toString());

      sqlQueryString = 'select distinct Location from stackoverflow';
      result = this.DB.exec(sqlQueryString)?.[0];
      const locations = result.values.map(value => value.toString());

      sqlQueryString = 'select distinct Year from stackoverflow order by Year';
      result = this.DB.exec(sqlQueryString)?.[0];
      const years = result.values.map(value => value.toString());

      this.selectedLocations = locations;
      this.selectedYears = years;
      const datasetInfo = { techs, locations, years };

      await loading.dismiss();

      return datasetInfo;
    }
  }

  private async queryData() {
    if (this.DB && this.datasetInfo && this.selectedTechs.length > 0) {
      const loading = await loadingController.create({
        message: `Qeurying data...`,
      });
      await loading.present();

      let sqlQueryString = '';
      switch (this.statisticsColumnsOption) {
        case 'active-years':
          sqlQueryString = `select stackoverflow.*, helper.ActiveYears from stackoverflow, (select (max(Year) - min(Year) + 1) as ActiveYears, UserId from stackoverflow group by UserId) as helper where stackoverflow.userId = helper.userId and stackoverflow.Tech in (${this.selectedTechs
            .map(value => `\'${value}\'`)
            .join(', ')}) and stackoverflow.Year in (${this.selectedYears.map(value => `\'${value}\'`).join(', ')}) and stackoverflow.Location in (${this.selectedLocations
            .map(value => `\'${value}\'`)
            .join(', ')})`;
          break;
        case 'tech-count':
          sqlQueryString = `select stackoverflow.*, helper.TechCount from stackoverflow, (select count(distinct Tech) as TechCount, UserId, Year from stackoverflow where Tech in (${this.selectedTechs
            .map(value => `\'${value}\'`)
            .join(
              ', ',
            )}) group by UserId, Year) as helper where stackoverflow.userId = helper.userId and stackoverflow.Year = helper.Year and stackoverflow.Tech in (${this.selectedTechs
            .map(value => `\'${value}\'`)
            .join(', ')}) and stackoverflow.Year in (${this.selectedYears.map(value => `\'${value}\'`).join(', ')}) and stackoverflow.Location in (${this.selectedLocations
            .map(value => `\'${value}\'`)
            .join(', ')})`;
          break;
        case 'tech-count-all':
          sqlQueryString = `select stackoverflow.*, helper.TechCount from stackoverflow, (select count(distinct Tech) as TechCount, UserId, Year from stackoverflow group by UserId, Year) as helper where stackoverflow.userId = helper.userId and stackoverflow.Year = helper.Year and stackoverflow.Tech in (${this.selectedTechs
            .map(value => `\'${value}\'`)
            .join(', ')}) and stackoverflow.Year in (${this.selectedYears.map(value => `\'${value}\'`).join(', ')}) and stackoverflow.Location in (${this.selectedLocations
            .map(value => `\'${value}\'`)
            .join(', ')})`;
          break;
      }
      const result = this.DB.exec(sqlQueryString)?.[0];

      const data = result?.values.map(value => {
        const datum = {};
        for (let i = 0; i < value.length; i++) {
          datum[result.columns[i]] = ['Tech', 'UserId', 'Location'].indexOf(result.columns[i]) >= 0 ? value[i] : value[i] ? +value[i] : 0;
        }
        return datum;
      });
      this.data = await this.processData(data);

      await loading.dismiss();
    }
  }

  private async processData(data: any[]) {
    for (const datum of data) {
      for (const selectedTech of this.selectedTechs) {
        switch (this.statisticsColumnsOption) {
          case 'active-years':
            datum[selectedTech] = datum['Tech'] === selectedTech ? datum['ActiveYears'] : undefined;
            break;
          case 'tech-count':
            datum[selectedTech] = datum['Tech'] === selectedTech ? datum['TechCount'] : undefined;
            break;
        }
      }
    }

    if (this.isActiveYearsSegmentsEnabled) {
      const allActiveYearsValues = new Set(data.map(d => +d['ActiveYears']));
      const minValue = d3.min(allActiveYearsValues);
      const maxValue = d3.max(allActiveYearsValues);
      const thresholds = [minValue, minValue + (maxValue - minValue) * 0.25, minValue + (maxValue - minValue) * 0.5, minValue + (maxValue - minValue) * 0.75, maxValue];
      const scale = d3.scaleThreshold().domain(thresholds).range([-1, 0, 1, 2, 3]);
      for (const datum of data) {
        const activeYearsIndex = scale(datum['ActiveYears']);
        datum['ActiveYears'] = `${thresholds[activeYearsIndex]}, ${thresholds[activeYearsIndex + 1]}`;
      }
    }

    return data;
  }

  private generateHeatmapData() {
    if (this.data && this.orderedTechs) {
      const xLabels = this.data
        .filter((d, i) => this.data.findIndex(dd => dd.Year == d.Year) === i)
        .map(d => d.Year)
        .sort(d3.ascending);
      const yLabels = this.orderedTechs;
      const data = [];
      for (const yLabel of yLabels) {
        const rowData = [];
        for (const xLabel of xLabels) {
          rowData.push(this.data.filter(d => d.Year.toString() === xLabel.toString() && d.Tech.toString() === yLabel.toString()).length);
        }
        data.push(rowData);
      }
      return { data, xLabels, yLabels };
    }
  }

  // private resetVisStates() {

  // }
}
