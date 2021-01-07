import { alertController, loadingController } from '@ionic/core';
import { Component, Host, h, ComponentInterface, State } from '@stencil/core';
import initSqlJs from 'sql.js';
import { SqlJs } from 'sql.js/module';
import * as d3 from 'd3';
import { ParallelSetsDataNode, ParallelSetsOnLoadDetail, ParallelSetsDimensionValueSortingHandler } from '../s-parallel-sets/utils';

@Component({
  tag: 'app-weather-vis',
  styleUrl: 'app-weather-vis.css',
  scoped: true,
})
export class AppWeatherVis implements ComponentInterface {

  private readonly databaseName = 'weather';
  private readonly variableDisplayNameDict: { [variableName: string]: string } = {
    'Elevation': 'Elevation',
    'MaxTemperature': 'MaxTemp',
    'MinTemperature': 'MinTemp',
    'Precipitation': 'Precipitation',
    'Wind': 'Wind',
    'RelativeHumidity': 'RelHumi',
    'Solar': 'Solar'
  }
  private readonly variableOptions: string[] = [
    'Elevation',
    'MaxTemperature',
    'MinTemperature',
    'Precipitation',
    'Wind',
    'RelativeHumidity',
    'Solar'
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
    () => textureGenerator.lines().stroke('transparent'),
    () => textureGenerator.circles().radius(2),
    () => textureGenerator.lines().orientation('2/8').size(10),
    () => textureGenerator.lines().orientation('2/8').size(10).heavier(),
    () => textureGenerator.lines().orientation('8/8').size(10),
    () => textureGenerator.lines().orientation('8/8').size(10).heavier(),
    () => textureGenerator.lines().orientation('6/8').size(10),
    () => textureGenerator.lines().orientation('6/8').size(10).heavier()
  ];

  private SQL: SqlJs.SqlJsStatic;
  private visRenderLoadingElement: HTMLIonLoadingElement;
  private setStatOnLoadDetail: ParallelSetsOnLoadDetail; // TODO set stat not matching parallel sets here
  private parallelSetsDateAxisSortedBy: { dimensionName: string, orderBy: 'ascending' | 'descending' };
  private setStatElement: HTMLSSetStatElement;

  @State() file: File;
  @State() DB: SqlJs.Database;
  @State() categorizationMethod: 'quantile' | 'value' = 'quantile';
  @State() selectedVariables: string[];
  @State() data: any[];
  @State() visFillOpacity: number = .5;
  @State() visFillHighlightOpacity: number = .8;
  @State() isSecondaryVisEnabled: boolean = false;
  @State() mapRange: {
    minLatitude: number;
    maxLatitude: number;
    minLongitude: number;
    maxLongitude: number;
  };
  @State() datasetInfo: {
    minLatitude: number,
    maxLatitude: number,
    latitudeCount: number,
    minLongitude: number,
    maxLongitude: number,
    longitudeCount: number
  };
  @State() mapViewHeatmapData: {
    legendInnerHTML: string,
    primaryValueTitle: string,
    secondaryValueHeader: string,
    isTooltipEnabled: boolean,
    dataPoints: {
      latitude: number,
      longitude: number,
      primaryValue: string | number,
      color: string,
      secondaryValue: string | number,
      textureDenerator: any,
      rectWidth: number,
      rectHeight: number
    }[]
  };
  @State() parallelSetsDimensionValueSortingMethods: ParallelSetsDimensionValueSortingHandler | { [dimensionName: string]: ParallelSetsDimensionValueSortingHandler } = {
    '': (a, b) => +a.toString().split(' ~ ')[0] - +b.toString().split(' ~ ')[0],
    'Date': undefined
  };
  @State() headerTextColor: string | { [dimensionName: string]: string } = 'rgb(0,0,0)';

  async connectedCallback() {
    this.SQL = await initSqlJs({ locateFile: fileName => `./assets/sql.js/${fileName}` });
    this.visRenderLoadingElement = await loadingController.create({
      message: `Rendering vis...`
    });
  }

  componentShouldUpdate(_newValue: any, _oldValue: any, propName: string) {
    const propertiesRequireQueryingData = ['DB', 'selectedVariables', 'mapRange'];
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
              <ion-button title="Generate Database File" href="/weather/data-process">
                <ion-icon slot="icon-only" name="construct"></ion-icon>
              </ion-button>
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
            <ion-list>
              <ion-item class="control-panel-item">
                <ion-label class="control-panel-item-label">Base Opacity</ion-label>
                <ion-range
                  min={0}
                  max={1}
                  step={.01}
                  value={this.visFillOpacity}
                  onIonChange={({ detail }) => this.visFillOpacity = +detail.value}
                >
                  <ion-label slot="start">0</ion-label>
                  <ion-label slot="end">1</ion-label>
                </ion-range>
              </ion-item>
              <ion-item class="control-panel-item">
                <ion-label class="control-panel-item-label">Highlight Opacity</ion-label>
                <ion-range
                  min={0}
                  max={1}
                  step={.01}
                  value={this.visFillHighlightOpacity}
                  onIonChange={({ detail }) => this.visFillHighlightOpacity = +detail.value}
                >
                  <ion-label slot="start">0</ion-label>
                  <ion-label slot="end">1</ion-label>
                </ion-range>
              </ion-item>
              <ion-item class="control-panel-item" disabled={!this.datasetInfo}>
                <ion-label class="control-panel-item-label">Categorization Method</ion-label>
                <ion-select
                  value={this.categorizationMethod}
                  onIonChange={({ detail }) => this.categorizationMethod = detail.value}
                >
                  <ion-select-option value="quantile">By Quantile</ion-select-option>
                  <ion-select-option value="value">By Value</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item class="control-panel-item" disabled={!this.datasetInfo}>
                <ion-label class="control-panel-item-label">Variables</ion-label>
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
              <ion-item class="control-panel-item" disabled={!this.datasetInfo}>
                <ion-label class="control-panel-item-label">Order By</ion-label>
                <ion-reorder-group
                  disabled={false}
                  onIonItemReorder={({ detail }) => {
                    const selectedVariables = [...this.selectedVariables];
                    detail.complete(selectedVariables);
                    this.selectedVariables = selectedVariables;
                  }}
                >
                  {
                    this.selectedVariables?.map(variable => (
                      <ion-item>
                        <ion-label>{variable}</ion-label>
                        <ion-reorder slot="start"></ion-reorder>
                      </ion-item>
                    ))
                  }
                </ion-reorder-group>
              </ion-item>
              <ion-item class="control-panel-item" disabled={!this.datasetInfo}>
                <ion-label class="control-panel-item-label">Enable Secondary Vis</ion-label>
                <ion-toggle
                  checked={this.isSecondaryVisEnabled}
                  onIonChange={({ detail }) => this.isSecondaryVisEnabled = detail.checked}
                ></ion-toggle>
              </ion-item>
            </ion-list>
          </ion-menu>

          <ion-content id="main-container" class="ion-padding">
            {
              this.data && this.selectedVariables?.length &&
              this.renderMainVis()
            }
            {
              this.data && this.selectedVariables?.length && this.isSecondaryVisEnabled &&
              this.renderMainVis()
            }
            {
              !this.file &&
              <ion-text>
                In this visualization, the dataset contains multiple weather variables for a certain area. The variables are as below:
                <ul>
                  <li>Temperature (°C)</li>
                  <li>Precipitation (mm)</li>
                  <li>Wind (m/s)</li>
                  <li>Relative Humidity (fraction)</li>
                  <li>Solar (MJ/m2)</li>
                </ul>
                Please open a database file to start. If you do not have a database file, you will need to generate one. You can check the buttons on the upper-right corner to open a database file (Open Database File) or generate a new one (Generate Database File).
                 </ion-text>
            }
            {
              this.file && !this.selectedVariables?.length &&
              <ion-text>Please select some variables to display the visualization. You can configure parameters of the visualization from the side menu. (the suggested number of variables to be selected is from 2 to 4)</ion-text>
            }
          </ion-content>
        </ion-split-pane>
      </Host>
    );
  }

  private renderMainVis() {
    return <ion-card class="vis-container">
      <s-set-stat
        ref={el => this.setStatElement = el}
        onVisWillRender={() => this.toggleVisRenderLoading(true)}
        onVisLoad={({ detail }) => {
          this.toggleVisRenderLoading(false);
          this.setStatOnLoadDetail = detail;
        }}
        data={this.data}
        parallel-sets-ribbon-tension={.5}
        ribbonAndRowOpacity={this.visFillOpacity}
        ribbonAndRowHighlightOpacity={this.visFillHighlightOpacity}
        parallelSetsDimensions={this.selectedVariables.map(variableName => `_${variableName}`).concat('Date')}
        parallelSetsMaxAxisSegmentCount={12}
        colorScheme={this.colorScheme}
        defineTexturesHandler={this.defineTexturesHandler}
        statisticsColumnDefinitions={this.selectedVariables.map(variableName => ({
          dimensionName: variableName,
          visType: 'box'
        }))}
        dimensionDisplyedNameDict={Object.fromEntries([
          ...this.selectedVariables.map(variableName => [`_${variableName}`, this.variableDisplayNameDict[variableName]]),
          ...this.selectedVariables.map(variableName => [variableName, this.variableDisplayNameDict[variableName]]),
        ])}
        parallelSetsDimensionValueSortingMethods={this.parallelSetsDimensionValueSortingMethods}
        headerTextColor={this.headerTextColor}
        onParallelSetsAxisSegmentClick={({ detail }) => this.drawHeatmapOnMapView(detail.dimensionName, detail.value, detail.dataNodes)}
        onStatisticsColumnsHeaderClick={({ detail }) => this.statisticsColumnsHeaderClickHanlder(detail)}
      ></s-set-stat>
      <app-map-view
        centerPoint={[
          (this.datasetInfo.maxLatitude + this.datasetInfo.minLatitude) / 2,
          (this.datasetInfo.maxLongitude + this.datasetInfo.minLongitude) / 2
        ]}
        zoom={5.5}
        heatmapData={this.mapViewHeatmapData}
        heatmapOpacity={this.visFillOpacity}
        heatmapHighlightOpacity={this.visFillHighlightOpacity}
        onMouseDraw={({ detail }) => this.mapRange = detail}
      ></app-map-view>
    </ion-card>;
  }

  private async statisticsColumnsHeaderClickHanlder(dimensionName: string) {
    if (this.parallelSetsDateAxisSortedBy?.dimensionName === dimensionName && this.parallelSetsDateAxisSortedBy?.orderBy === 'ascending') {
      this.parallelSetsDateAxisSortedBy = { dimensionName, orderBy: 'descending' };
      const headerTextColor = {};
      headerTextColor[''] = 'black';
      headerTextColor[dimensionName] = 'blue';
      this.headerTextColor = headerTextColor;
    } else if (this.parallelSetsDateAxisSortedBy?.dimensionName === dimensionName && this.parallelSetsDateAxisSortedBy?.orderBy === 'descending') {
      this.parallelSetsDateAxisSortedBy = undefined;
      this.headerTextColor = 'black';
    } else {
      this.parallelSetsDateAxisSortedBy = { dimensionName, orderBy: 'ascending' };
      const headerTextColor = {};
      headerTextColor[''] = 'black';
      headerTextColor[dimensionName] = 'red';
      this.headerTextColor = headerTextColor;
    }

    await this.setStatElement.reorderParallelSetsLastAxisByDimension(this.parallelSetsDateAxisSortedBy?.dimensionName, this.parallelSetsDateAxisSortedBy?.orderBy);
  }

  private drawHeatmapOnMapView(
    dimensionName: string,
    legendHeader: string | number,
    dataNodes: ParallelSetsDataNode[]
  ) {
    const dataRecords = dataNodes.flatMap(dataNode => dataNode.dataRecords);
    const colorDict = this.setStatOnLoadDetail.colorDict;
    const textureGeneratorDict = this.setStatOnLoadDetail.textureGeneratorDict;
    const dataPoints = dataRecords.map(dataRecord => {
      const primaryValue = dataRecord['_' + this.selectedVariables[0]];
      const secondaryValue = dataRecord['_' + this.selectedVariables[1]];
      return {
        latitude: +dataRecord.Latitude,
        longitude: +dataRecord.Longitude,
        primaryValue,
        color: colorDict[primaryValue],
        secondaryValue,
        textureDenerator: textureGeneratorDict[secondaryValue],
        rectWidth: .312,
        rectHeight: .312
      };
    });
    const legendInnerHTML = `<h4>${legendHeader}</h4>${Object.entries(colorDict).map(([value, color]) => `<i style="background: ${color}"></i><span>${value}</span><br/>`).join('')}`;
    this.mapViewHeatmapData = {
      dataPoints,
      legendInnerHTML,
      primaryValueTitle: this.selectedVariables[0],
      secondaryValueHeader: this.selectedVariables[1],
      isTooltipEnabled: dimensionName === 'Date'
    };
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

      let sqlQueryString =
        `select substr(Date, 0, 8) as Date, Latitude, Longitude, ${this.selectedVariables.map(variable => `avg(${variable}) as ${variable}`).join(', ')} ` +
        `from ${this.databaseName}`;
      if (this.mapRange) {
        sqlQueryString += ` where Latitude >= ${this.mapRange.minLatitude} and Latitude <= ${this.mapRange.maxLatitude} and Longitude >= ${this.mapRange.minLongitude} and Longitude <= ${this.mapRange.maxLongitude}`;
      }
      sqlQueryString += ` group by substr(Date, 0, 8), Latitude, Longitude`
      const result = this.DB.exec(sqlQueryString)?.[0];

      const data = result?.values.map(value => {
        const datum = {};
        for (let i = 0; i < value.length; i++) {
          datum[result.columns[i]] = (result.columns[i] === 'Date') ? this.monthNumberAndNameDict[value[i].toString().substring(5)] : +value[i];
        }
        return datum;
      });

      this.mapViewHeatmapData = undefined;

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
    this.resetVisStates();
    const fileBuffer = await file.arrayBuffer();
    const DB = new this.SQL.Database(new Uint8Array(fileBuffer));
    const datasetInfo = this.obtainDatasetInfo(DB);
    await loading.dismiss();

    if (datasetInfo) {
      this.file = file;
      this.DB = DB;
      this.datasetInfo = datasetInfo;
    } else {
      const alert = await alertController.create({
        header: 'Invalid Database File',
        message: 'The database file opened seems to be invalid, please check the file and try again.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  private obtainDatasetInfo(DB: SqlJs.Database) {
    try {
      const sqlQueryString = 'select min(Latitude) as minLatitude, max(Latitude) as maxLatitude, count(distinct Latitude) as latitudeCount, min(Longitude) as minLongitude, max(Longitude) as maxLongitude, count(distinct Longitude) as longitudeCount from weather';
      const result = DB?.exec(sqlQueryString)?.[0];
      const datasetInfo: {
        minLatitude: number,
        maxLatitude: number,
        latitudeCount: number,
        minLongitude: number,
        maxLongitude: number,
        longitudeCount: number
      } = result?.values.map(value => {
        const datum: any = {};
        for (let i = 0; i < value.length; i++) {
          datum[result.columns[i]] = +value[i];
        }
        return datum;
      })[0];
      return datasetInfo;
    } catch {
      return null;
    }
  }

  private resetVisStates() {
    this.file = undefined;
    this.DB = undefined;
    this.data = undefined;
    this.categorizationMethod = 'quantile';
    this.selectedVariables = undefined;
    this.datasetInfo = undefined;
  }

}
