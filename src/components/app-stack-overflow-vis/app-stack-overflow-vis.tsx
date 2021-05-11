import { alertController, loadingController } from '@ionic/core';
import { Component, Host, h, ComponentInterface, Prop, Watch, State, Event, EventEmitter } from '@stencil/core';
import initSqlJs from 'sql.js';
import { SqlJs } from 'sql.js/module';
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

  @State() data: any[];
  @State() datasetInfo: { techs: string[] };
  @State() statisticsColumnDefinitions: {
    dimensionName: string,
    visType: StatisticsColumnsVisType
  }[] = [];
  @State() orderedTechs: string[];

  @State() selectedTechs: string[] = [];
  @Watch('selectedTechs')
  async selectedTechsWatchHandler(selectedTechs: string[]) {
    await this.queryData();
    this.orderedTechs = [...selectedTechs];
    this.statisticsColumnDefinitions = selectedTechs.map(selectedTech => ({
      dimensionName: selectedTech,
      visType: 'bar'
    }));
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
    return (
      <Host>
        {
          this.data &&
          <ion-card class="vis-container">
            <s-set-stat
              data={this.data}
              parallelSetsDimensions={['ActiveYears', 'Tech', 'Year']}
              parallelSetsAutoMergedAxisSegmentMaxRatio={.1}
              parallelSetsRibbonTension={.5}
              statisticsColumnDefinitions={this.statisticsColumnDefinitions}
              parallelSetsDimensionValueSortingMethods={{
                'Tech': (a, b) => this.orderedTechs.indexOf(a.toString()) - this.orderedTechs.indexOf(b.toString()),
                'Year': (a, b) => +a - +b,
                'ActiveYears': (a, b) => +b - +a
              }}
            ></s-set-stat>
          </ion-card>
        }
      </Host>
    );
  }

  private renderControlPanel() {
    return (
      <ion-list>
        <ion-item disabled={!this.datasetInfo?.techs}>
          <ion-label>Techs</ion-label>
          <ion-select
            multiple
            onIonChange={({ detail }) => this.selectedTechs = detail.value}
          >
            {
              this.datasetInfo?.techs?.map(tech => (
                <ion-select-option value={tech}>{tech}</ion-select-option>
              ))
            }
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label class="control-panel-item-label">Order By</ion-label>
          <ion-content style={{ height: '150px' }}>
            <ion-reorder-group
              disabled={false}
              onIonItemReorder={({ detail }) => {
                const orderedTechs = [...this.orderedTechs];
                detail.complete(orderedTechs);
                this.orderedTechs = orderedTechs;
              }}
            >
              {
                this.orderedTechs?.map(tech => (
                  <ion-item>
                    <ion-label>{tech}</ion-label>
                    <ion-reorder slot="start"></ion-reorder>
                  </ion-item>
                ))
              }
            </ion-reorder-group>
          </ion-content>
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
        this.datasetInfo = await this.obtainDatasetInfo();
      } else {
        this.alertInvalidDatabase();
      }
    } catch { }
  }

  private async alertInvalidDatabase() {
    const alert = await alertController.create({
      header: 'Invalid Database File',
      message: 'The database file opened seems to be invalid, please check the file and try again.',
      buttons: ['OK']
    });
    await alert.present();
  }

  private async obtainDatasetInfo() {
    if (this.DB) {
      const loading = await loadingController.create({
        message: `Obtaining dataset info...`
      });
      await loading.present();

      const sqlQueryString = 'select distinct Tech from stackoverflow';
      const result = this.DB.exec(sqlQueryString)?.[0];

      const datasetInfo = { techs: result.values.map((value => value.toString())) };

      await loading.dismiss();

      return datasetInfo;
    }
  }

  private async queryData() {
    if (this.DB) {
      const loading = await loadingController.create({
        message: `Qeurying data...`
      });
      await loading.present();

      const sqlQueryString = `select stackoverflow.*, helper.ActiveYears from stackoverflow, (select (max(Year) - min(Year) + 1) as ActiveYears, UserId from stackoverflow group by UserId) as helper where stackoverflow.userId = helper.userId and stackoverflow.Tech in (${this.selectedTechs.map(value => `\'${value}\'`).join(', ')})`;
      const result = this.DB.exec(sqlQueryString)?.[0];

      const data = result?.values.map(value => {
        const datum = {};
        for (let i = 0; i < value.length; i++) {
          datum[result.columns[i]] = (result.columns[i] === 'Tech') ? value[i] : (value[i] ? +value[i] : 0);
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
        datum[selectedTech] = datum['Tech'] === selectedTech ? 1 : 0;
      }
    }
    return data;
  }

  // private resetVisStates() {

  // }

}
