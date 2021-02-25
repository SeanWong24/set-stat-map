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

  private readonly variableValueMinMaxSeperator = ', ';
  private readonly databaseName = 'weather';
  private readonly variableDisplayNameDict: { [variableName: string]: string } = {
    'Elevation': 'Elevation',
    'MaxTemperature': 'MaxTemp',
    'MinTemperature': 'MinTemp',
    'Precipitation': 'Precipitation',
    'Wind': 'Wind',
    'RelativeHumidity': 'RelHumi',
    'Solar': 'Solar',
    'Date': 'Month'
  };
  private readonly variableUnitDict: { [variableName: string]: string } = {
    '_Elevation': 'm',
    '_MaxTemperature': '°C',
    '_MinTemperature': '°C',
    '_Precipitation': 'mm',
    '_Wind': 'm/s',
    '_RelativeHumidity': '%',
    '_Solar': 'MJ/m^2',
    'Date': ' '
  };
  private readonly variableOptions: string[] = [
    'Elevation',
    'MaxTemperature',
    'MinTemperature',
    'Precipitation',
    'Wind',
    'RelativeHumidity',
    'Solar'
  ];
  private readonly variableNameAndColorSchemeDict = {
    'MaxTemperature': [
      'rgb(33,102,172)',
      'rgb(209,229,240)',
      'rgb(244,165,130)',
      'rgb(103,10,31)'
    ],
    'MinTemperature': [
      'rgb(33,102,172)',
      'rgb(209,229,240)',
      'rgb(244,165,130)',
      'rgb(103,10,31)'
    ],
    'Precipitation': [
      'rgb(84,48,4)',
      'rgb(223,194,125)',
      'rgb(109,234,229)',
      'rgb(0,102,93)'
    ]
  };
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
  private readonly textureOpacities = [.25, .5, .75, 1];
  private readonly defineTexturesHandlerForFour: (textureGenerator: any) => (() => any)[] = (textureGenerator) => this.textureOpacities.map(opacity => () => textureGenerator.circles().thicker().fill(`rgba(0,0,0,${opacity})`));
  // private readonly defineTexturesHandlerForEight: (textureGenerator: any) => (() => any)[] = (textureGenerator) => [
  //   () => textureGenerator.lines().stroke('transparent'),
  //   () => textureGenerator.circles().radius(2),
  //   () => textureGenerator.lines().orientation('2/8').size(10),
  //   () => textureGenerator.lines().orientation('2/8').size(10).heavier(),
  //   () => textureGenerator.lines().orientation('8/8').size(10),
  //   () => textureGenerator.lines().orientation('8/8').size(10).heavier(),
  //   () => textureGenerator.lines().orientation('6/8').size(10),
  //   () => textureGenerator.lines().orientation('6/8').size(10).heavier()
  // ];

  private SQL: SqlJs.SqlJsStatic;
  private visRenderLoadingElement: HTMLIonLoadingElement;
  private setStatOnLoadDetail: ParallelSetsOnLoadDetail; // TODO set stat not matching parallel sets here
  private parallelSetsDateAxisSortedBy: { dimensionName: string, orderBy: 'ascending' | 'descending' };
  private secondaryVisParallelSetsDateAxisSortedBy: { dimensionName: string, orderBy: 'ascending' | 'descending' };
  private setStatElement: HTMLSSetStatElement;
  private secondaryVisSetStatElement: HTMLSSetStatElement;
  private variableNameAndCategorizedValuesDict: { [variableName: string]: string[] };
  private secondaryVisVariableNameAndCategorizedValuesDict: { [variableName: string]: string[] };


  private get colorScheme() {
    return this.variableNameAndColorSchemeDict[this.selectedVariables?.[0]] || [
      '#4575b4',
      '#abd9e9',
      '#fee090',
      '#f46d43'
    ];
  };
  private get secondaryVisColorScheme() {
    if (this.secondaryVisVariableNameAndCategorizedValuesDict) {
      const colorScheme: string[] = [];
      const firstVisCategorizedValuesForFirstDimension = this.variableNameAndCategorizedValuesDict[this.selectedVariables[0]];
      const secondaryVisCategorizedValuesForFirstDimension = this.secondaryVisVariableNameAndCategorizedValuesDict[this.selectedVariables[0]];
      for (let i = 0; i < secondaryVisCategorizedValuesForFirstDimension.length; i++) {
        if (i === 0 && secondaryVisCategorizedValuesForFirstDimension[0] !== firstVisCategorizedValuesForFirstDimension[0]) {
          colorScheme.push('rgb(200,200,200)');
        } else if (i === (secondaryVisCategorizedValuesForFirstDimension.length - 1) && secondaryVisCategorizedValuesForFirstDimension[secondaryVisCategorizedValuesForFirstDimension.length - 1] !== firstVisCategorizedValuesForFirstDimension[firstVisCategorizedValuesForFirstDimension.length - 1]) {
          colorScheme.push('rgb(100,100,100)');
        } else {
          colorScheme.push(this.colorScheme[firstVisCategorizedValuesForFirstDimension.indexOf(secondaryVisCategorizedValuesForFirstDimension[i])]);
        }
      }
      return colorScheme;
    } else {
      return this.colorScheme;
    }
  }
  private get defineTexturesHandler() {
    // return this.categorizationMethod === 'quantile' ? this.defineTexturesHandlerForFour : this.defineTexturesHandlerForEight;
    // TODO not yet handle textures for eight
    return this.defineTexturesHandlerForFour;
  }
  private get secondaryVisDefineTexturesHandler() {
    if (this.secondaryVisVariableNameAndCategorizedValuesDict) {
      const defineTexturesHandler = ((textureGenerator: any) => {
        const handlers: (() => any)[] = [];
        const firstVisCategorizedValuesForSecondDimension = this.variableNameAndCategorizedValuesDict[this.selectedVariables[1]];
        const secondaryVisCategorizedValuesForSecondDimension = this.secondaryVisVariableNameAndCategorizedValuesDict[this.selectedVariables[1]];
        for (let i = 0; i < secondaryVisCategorizedValuesForSecondDimension.length; i++) {
          if (i === 0 && secondaryVisCategorizedValuesForSecondDimension[0] !== firstVisCategorizedValuesForSecondDimension[0]) {
            handlers.push(() => textureGenerator.circles().thicker().fill('transparent').strokeWidth(1).stroke("black"));
          } else if (i === (secondaryVisCategorizedValuesForSecondDimension.length - 1) && secondaryVisCategorizedValuesForSecondDimension[secondaryVisCategorizedValuesForSecondDimension.length - 1] !== firstVisCategorizedValuesForSecondDimension[firstVisCategorizedValuesForSecondDimension.length - 1]) {
            handlers.push(() => textureGenerator.circles().thicker().fill('transparent').strokeWidth(3).stroke("black"));
          } else {
            handlers.push(
              this.defineTexturesHandler(textureGenerator)[firstVisCategorizedValuesForSecondDimension.indexOf(secondaryVisCategorizedValuesForSecondDimension[i])] ||
              (() => textureGenerator.lines().stroke('transparent'))
            );
          }
        }
        return handlers;
      });
      return defineTexturesHandler;
    } else {
      return this.defineTexturesHandler;
    }
  }

  @State() file: File;
  @State() DB: SqlJs.Database;
  @State() categorizationMethod: 'quantile' | 'uniform' = 'uniform';
  @State() selectedVariables: string[];
  @State() data: any[];
  @State() secondaryVisData: any[];
  @State() visFillOpacity: number = .5;
  @State() visFillHighlightOpacity: number = .8;
  @State() isSecondaryVisEnabled: boolean = false;
  @State() mapRange: {
    minLatitude: number;
    maxLatitude: number;
    minLongitude: number;
    maxLongitude: number;
  };
  @State() secondaryVisMapRange: {
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
    colorLegendTitle: string;
    colorLegendDefinitions: { value: string, color: string }[];
    textureLegendTitle: string;
    textureLegendDefinitions: { value: string, textureGenerator: any }[];
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
  @State() secondaryVisMapViewHeatmapData: {
    colorLegendTitle: string;
    colorLegendDefinitions: { value: string, color: string }[];
    textureLegendTitle: string;
    textureLegendDefinitions: { value: string, textureGenerator: any }[];
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
    '': (a, b) => +a.toString().split(this.variableValueMinMaxSeperator)[0] - +b.toString().split(this.variableValueMinMaxSeperator)[0],
    'Date': undefined
  };
  @State() headerTextColor: string | { [dimensionName: string]: string } = 'rgb(0,0,0)';
  @State() mapViewHeader: string = 'No Selected Subset';
  @State() secondaryVisMapViewHeader: string = 'No Selected Subset';

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
    const propertiesRequireQueryingDataForSecondaryVis = ['secondaryVisMapRange'];
    const shouldQueryDataForSecondaryVis = propertiesRequireQueryingDataForSecondaryVis.find(name => name === propName);
    const propertiesRequireReprocessingDataForSecondaryVis = ['data', 'categorizationMethod'];
    const shouldReprocessDataForSecondaryVis = propertiesRequireReprocessingDataForSecondaryVis.find(name => name === propName);

    if (shouldQueryData) {
      this.updateData(true);
    } else if (shouldReprocessData) {
      this.updateData(false);
    } else if (shouldQueryDataForSecondaryVis) {
      this.updateData(true, true)
    } else if (shouldReprocessDataForSecondaryVis) {
      this.updateData(false, true);
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
                <ion-label class="control-panel-item-label">Category</ion-label>
                <ion-select
                  value={this.categorizationMethod}
                  onIonChange={({ detail }) => this.categorizationMethod = detail.value}
                >
                  <ion-select-option value="quantile">Quantile</ion-select-option>
                  <ion-select-option value="uniform">Uniform</ion-select-option>
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
                <ion-label class="control-panel-item-label">Compare Another Region</ion-label>
                <ion-toggle
                  checked={this.isSecondaryVisEnabled}
                  onIonChange={({ detail }) => {
                    this.isSecondaryVisEnabled = detail.checked;
                    if (detail.checked) {
                      this.updateData(true, true);
                    } else {
                      this.secondaryVisData = undefined;
                    }
                  }}
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
              this.renderMainVis(true)
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

  private renderMainVis(isSecondaryVis?: boolean) {
    return <ion-card class="vis-container">
      <s-set-stat
        ref={isSecondaryVis ? (el => this.secondaryVisSetStatElement = el) : (el => this.setStatElement = el)}
        onVisWillRender={() => this.toggleVisRenderLoading(true)}
        onVisLoad={({ detail }) => {
          this.toggleVisRenderLoading(false);
          this.setStatOnLoadDetail = detail;
        }}
        data={
          isSecondaryVis ?
            this.secondaryVisData :
            this.data
        }
        parallel-sets-ribbon-tension={.5}
        ribbonAndRowOpacity={this.visFillOpacity}
        ribbonAndRowHighlightOpacity={this.visFillHighlightOpacity}
        parallelSetsDimensions={this.selectedVariables.map(variableName => `_${variableName}`).concat('Date')}
        parallelSetsMaxAxisSegmentCount={12}
        colorScheme={
          isSecondaryVis ?
            this.secondaryVisColorScheme :
            this.colorScheme
        }
        defineTexturesHandler={
          isSecondaryVis ?
            this.secondaryVisDefineTexturesHandler :
            this.defineTexturesHandler
        }
        statisticsColumnDefinitions={this.selectedVariables.map(variableName => ({
          dimensionName: variableName,
          visType: 'box'
        }))}
        dimensionDisplyedNameDict={Object.fromEntries([
          ...this.selectedVariables.map(variableName => [`_${variableName}`, this.variableDisplayNameDict[variableName]]),
          ...this.selectedVariables.map(variableName => [variableName, this.variableDisplayNameDict[variableName]]),
          ['Date', this.variableDisplayNameDict['Date']]
        ])}
        parallelSetsDimensionValueSortingMethods={this.parallelSetsDimensionValueSortingMethods}
        parallelSetsFooter={this.variableUnitDict}
        headerTextColor={this.headerTextColor}
        onParallelSetsAxisSegmentClick={({ detail }) => this.drawHeatmapOnMapView(detail.dimensionName, detail.value, detail.dataNodes, isSecondaryVis)}
        onStatisticsColumnsHeaderClick={({ detail }) => this.statisticsColumnsHeaderClickHanlder(detail)}
      ></s-set-stat>
      <app-map-view
        centerPoint={[
          (this.datasetInfo.maxLatitude + this.datasetInfo.minLatitude) / 2,
          (this.datasetInfo.maxLongitude + this.datasetInfo.minLongitude) / 2
        ]}
        datasetRange={this.datasetInfo}
        zoom={5.5}
        header={
          isSecondaryVis ?
            this.secondaryVisMapViewHeader :
            this.mapViewHeader
        }
        heatmapData={
          isSecondaryVis ?
            this.secondaryVisMapViewHeatmapData :
            this.mapViewHeatmapData
        }
        heatmapOpacity={this.visFillOpacity}
        heatmapHighlightOpacity={this.visFillHighlightOpacity}
        onMouseDraw={
          isSecondaryVis ?
            (({ detail }) => this.secondaryVisMapRange = detail) :
            (({ detail }) => this.mapRange = detail)
        }
      ></app-map-view>
    </ion-card>;
  }

  private async statisticsColumnsHeaderClickHanlder(dimensionName: string, isSecondaryVis?: boolean) {
    const parallelSetsDateAxisSortedBy = isSecondaryVis ? this.secondaryVisParallelSetsDateAxisSortedBy : this.parallelSetsDateAxisSortedBy;

    if (parallelSetsDateAxisSortedBy?.dimensionName === dimensionName && parallelSetsDateAxisSortedBy?.orderBy === 'ascending') {
      if (isSecondaryVis) {
        this.parallelSetsDateAxisSortedBy = { dimensionName, orderBy: 'descending' };
      } else {
        this.parallelSetsDateAxisSortedBy = { dimensionName, orderBy: 'descending' };
      }
      const headerTextColor = {};
      headerTextColor[''] = 'black';
      headerTextColor[dimensionName] = 'blue';
      this.headerTextColor = headerTextColor;
    } else if (parallelSetsDateAxisSortedBy?.dimensionName === dimensionName && parallelSetsDateAxisSortedBy?.orderBy === 'descending') {
      if (isSecondaryVis) {
        this.secondaryVisParallelSetsDateAxisSortedBy = undefined;
      } else {
        this.parallelSetsDateAxisSortedBy = undefined;
      }
      this.headerTextColor = 'black';
    } else {
      if (isSecondaryVis) {
        this.secondaryVisParallelSetsDateAxisSortedBy = { dimensionName, orderBy: 'ascending' };
      } else {
        this.parallelSetsDateAxisSortedBy = { dimensionName, orderBy: 'ascending' };
      }
      const headerTextColor = {};
      headerTextColor[''] = 'black';
      headerTextColor[dimensionName] = 'red';
      this.headerTextColor = headerTextColor;
    }

    if (isSecondaryVis) {
      await this.secondaryVisSetStatElement.reorderParallelSetsLastAxisByDimension(this.secondaryVisParallelSetsDateAxisSortedBy?.dimensionName, this.secondaryVisParallelSetsDateAxisSortedBy?.orderBy);
    } else {
      await this.setStatElement.reorderParallelSetsLastAxisByDimension(this.parallelSetsDateAxisSortedBy?.dimensionName, this.parallelSetsDateAxisSortedBy?.orderBy);
    }
  }

  private drawHeatmapOnMapView(
    dimensionName: string,
    dimensionValue: string | number,
    dataNodes: ParallelSetsDataNode[],
    isSecondaryVis?: boolean
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
    const mapViewHeader = `${this.variableDisplayNameDict[dimensionName.replace(/^_/, '')]} - ${dimensionValue}`;
    const mapViewHeatmapData = {
      dataPoints,
      colorLegendTitle: this.variableDisplayNameDict[this.selectedVariables[0]],
      colorLegendDefinitions: Object.entries(colorDict).map(([value, color]) => ({ value, color })),
      textureLegendTitle: this.variableDisplayNameDict[this.selectedVariables[1]],
      textureLegendDefinitions: Object.entries(textureGeneratorDict).map(([value, textureGenerator]) => ({ value, textureGenerator })),
      primaryValueTitle: this.selectedVariables[0],
      secondaryValueHeader: this.selectedVariables[1],
      isTooltipEnabled: dimensionName === 'Date'
    };
    if (isSecondaryVis) {
      this.secondaryVisMapViewHeader = mapViewHeader;
      this.secondaryVisMapViewHeatmapData = mapViewHeatmapData;
    } else {
      this.mapViewHeader = mapViewHeader;
      this.mapViewHeatmapData = mapViewHeatmapData;
    }
  }

  private async toggleVisRenderLoading(isEnabled: boolean) {
    if (isEnabled) {
      await this.visRenderLoadingElement.present();
    } else {
      await this.visRenderLoadingElement.dismiss();
    }
  }

  private async updateData(shouldQuery: boolean, isForSecondaryVis?: boolean) {
    let data = isForSecondaryVis ? this.secondaryVisData : this.data;
    if (shouldQuery) {
      data = await this.queryData(isForSecondaryVis);
    }
    data = await this.processData(data, isForSecondaryVis);
    if (isForSecondaryVis) {
      this.secondaryVisData = [...data];
    } else {
      this.data = [...data];
    }
  }

  private async queryData(isForSecondaryVis?: boolean) {
    if (this.DB && this.selectedVariables?.length > 0) {
      const loading = await loadingController.create({
        message: `Qeurying data...`
      });
      await loading.present();

      let sqlQueryString =
        `select Date, Latitude, Longitude, ${this.selectedVariables.join(this.variableValueMinMaxSeperator)} ` +
        `from ${this.databaseName}`;
      if (isForSecondaryVis && this.secondaryVisMapRange) {
        sqlQueryString += ` where Latitude >= ${this.secondaryVisMapRange.minLatitude} and Latitude <= ${this.secondaryVisMapRange.maxLatitude} and Longitude >= ${this.secondaryVisMapRange.minLongitude} and Longitude <= ${this.secondaryVisMapRange.maxLongitude}`;
      } else if (!isForSecondaryVis && this.mapRange) {
        sqlQueryString += ` where Latitude >= ${this.mapRange.minLatitude} and Latitude <= ${this.mapRange.maxLatitude} and Longitude >= ${this.mapRange.minLongitude} and Longitude <= ${this.mapRange.maxLongitude}`;
      }
      const result = this.DB.exec(sqlQueryString)?.[0];

      const data = result?.values.map(value => {
        const datum = {};
        for (let i = 0; i < value.length; i++) {
          datum[result.columns[i]] = (result.columns[i] === 'Date') ? this.monthNumberAndNameDict[value[i].toString().substring(5)] : +value[i];
        }
        return datum;
      });

      if (isForSecondaryVis) {
        this.secondaryVisMapViewHeatmapData = undefined;
      } else {
        this.mapViewHeatmapData = undefined;
      }

      await loading.dismiss();

      return data;
    }
  }

  private async processData(data: any[], isForSecondaryVis?: boolean) {
    const loading = await loadingController.create({
      message: `Processing data...`
    });
    await loading.present();

    if (data) {
      if (isForSecondaryVis) {
        this.secondaryVisVariableNameAndCategorizedValuesDict = { ...this.variableNameAndCategorizedValuesDict };
        for (const variableName of this.selectedVariables) {
          const variableValues = data.map(d => +d[variableName]);
          const variableMinValue = d3.min(variableValues);
          const variableMaxValue = d3.max(variableValues);
          const firstVisCategorizedValues = this.variableNameAndCategorizedValuesDict?.[variableName]?.sort((a, b) => +a.toString().split(this.variableValueMinMaxSeperator)[0] - +b.toString().split(this.variableValueMinMaxSeperator)[0]);
          const firstVisVariableMinValue = +firstVisCategorizedValues?.[0]?.split(this.variableValueMinMaxSeperator)?.[0];
          const firstVisVariableMaxValue = +firstVisCategorizedValues?.[firstVisCategorizedValues.length - 1]?.split(this.variableValueMinMaxSeperator)?.[1];
          if (variableMinValue < firstVisVariableMinValue) {
            this.secondaryVisVariableNameAndCategorizedValuesDict[variableName] = [`${variableMinValue}${this.variableValueMinMaxSeperator}${firstVisVariableMinValue}`, ...this.secondaryVisVariableNameAndCategorizedValuesDict[variableName]];
          }
          if (variableMaxValue > firstVisVariableMaxValue) {
            this.secondaryVisVariableNameAndCategorizedValuesDict[variableName] = [...this.secondaryVisVariableNameAndCategorizedValuesDict[variableName], `${firstVisVariableMaxValue}${this.variableValueMinMaxSeperator}${variableMaxValue}`];
          }
          for (const dataRecord of data) {
            const variableValue = +dataRecord[variableName];
            dataRecord[`_${variableName}`] = this.secondaryVisVariableNameAndCategorizedValuesDict?.[variableName]
              ?.find((valueRange, index) => {
                const [minValue, maxValue] = valueRange.split(this.variableValueMinMaxSeperator);
                return (variableValue >= +minValue && variableValue < +maxValue) || (index === this.secondaryVisVariableNameAndCategorizedValuesDict[variableName].length - 1 && variableValue === +maxValue);
              })
              ?.split(this.variableValueMinMaxSeperator).map(value => (+value).toFixed(0)).join(this.variableValueMinMaxSeperator);
          }
        }
      } else {
        this.variableNameAndCategorizedValuesDict = {};
        switch (this.categorizationMethod) {
          case 'quantile':
            const variableNameAndQuantileScaleDict: { [variableName: string]: d3.ScaleQuantile<number, never> } = {};
            this.selectedVariables.forEach(variableName => variableNameAndQuantileScaleDict[variableName] = d3.scaleQuantile().domain(data.map(d => d[variableName])).range([0, 1, 2, 3]));
            this.selectedVariables.forEach(variableName => {
              const quantiles = variableNameAndQuantileScaleDict[variableName].quantiles();
              const variableValues = data.map(d => d[variableName]);
              const variableMinValue = d3.min(variableValues);
              const variableMaxValue = d3.max(variableValues);
              this.variableNameAndCategorizedValuesDict[variableName] = [
                `${variableMinValue}${this.variableValueMinMaxSeperator}${+quantiles[0]}`,
                `${+quantiles[0]}${this.variableValueMinMaxSeperator}${+quantiles[1]}`,
                `${+quantiles[1]}${this.variableValueMinMaxSeperator}${+quantiles[2]}`,
                `${+quantiles[2]}${this.variableValueMinMaxSeperator}${variableMaxValue}`
              ];
            });
            for (const dataRecord of data) {
              for (const variableName of this.selectedVariables) {
                const quantileValue = variableNameAndQuantileScaleDict[variableName](dataRecord[variableName]);
                dataRecord[`_${variableName}`] = this.variableNameAndCategorizedValuesDict[variableName][quantileValue].split(this.variableValueMinMaxSeperator).map(value => (+value).toFixed(0)).join(this.variableValueMinMaxSeperator);
              }
            }
            break;
          case 'uniform':
            const valueScaleDict = {};
            const valueThresholdDict = {};
            this.selectedVariables.forEach(variableName => {
              const values = data.map(d => d[variableName]);
              const minValue = d3.min(values);
              const maxValue = d3.max(values);
              const thresholds = [minValue, minValue + (maxValue - minValue) * .25, minValue + (maxValue - minValue) * .5, minValue + (maxValue - minValue) * .75, maxValue];
              valueThresholdDict[variableName] = thresholds;
              valueScaleDict[variableName] = d3.scaleThreshold().domain(thresholds).range([-1, 0, 1, 2, 3]);
              this.variableNameAndCategorizedValuesDict[variableName] = [
                `${thresholds[0]}${this.variableValueMinMaxSeperator}${thresholds[1]}`,
                `${thresholds[1]}${this.variableValueMinMaxSeperator}${thresholds[2]}`,
                `${thresholds[2]}${this.variableValueMinMaxSeperator}${thresholds[3]}`,
                `${thresholds[3]}${this.variableValueMinMaxSeperator}${thresholds[4]}`
              ];
            });
            for (const dataRecord of data) {
              for (const variableName of this.selectedVariables) {
                const thresholdValue = valueScaleDict[variableName](dataRecord[variableName]);
                dataRecord[`_${variableName}`] = this.variableNameAndCategorizedValuesDict[variableName][thresholdValue].split(this.variableValueMinMaxSeperator).map(value => (+value).toFixed(0)).join(this.variableValueMinMaxSeperator);
              }
            }
            this.selectedVariables.forEach(variableName => {
              this.variableNameAndCategorizedValuesDict[variableName] = this.variableNameAndCategorizedValuesDict[variableName].filter(v => data.filter(d => d[`_${variableName}`] === v.split(this.variableValueMinMaxSeperator).map(value => (+value).toFixed(0)).join(this.variableValueMinMaxSeperator)).length > 0);
            });
            break;
        }
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
    this.secondaryVisData = undefined;
    this.mapRange = undefined;
    this.secondaryVisMapRange = undefined;
    this.mapViewHeatmapData = undefined;
    this.secondaryVisMapViewHeatmapData = undefined;
    this.categorizationMethod = 'uniform';
    this.selectedVariables = undefined;
    this.datasetInfo = undefined;
  }

}
