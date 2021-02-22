import { Component, Host, h, ComponentInterface, Prop, State } from '@stencil/core';
import initSqlJs from 'sql.js';
import { SqlJs } from 'sql.js/module';
import * as d3 from 'd3';
import { alertController } from '@ionic/core';

@Component({
  tag: 'app-data-process',
  styleUrl: 'app-data-process.css',
  scoped: true,
})
export class AppDataProcess implements ComponentInterface {

  private SQL: SqlJs.SqlJsStatic;

  @Prop() datasetType: string;

  @State() dataDirectoryHandle: any;
  @State() outputFileHandle: any;
  @State() totalFileCount: number = 0;
  @State() processedFileCount: number = 0;

  async connectedCallback() {
    this.SQL = await initSqlJs({ locateFile: fileName => `./assets/sql.js/${fileName}` });
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-buttons slot="start">
              <ion-back-button defaultHref={`/${this.datasetType}`}></ion-back-button>
            </ion-buttons>
            <ion-title>Data Process {this.datasetType && `for ${this.datasetType[0].toUpperCase() + this.datasetType.slice(1)}`}</ion-title>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <ion-card>
            <ion-card-header>
              <ion-card-title>Step 1</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              Please follow bellow steps to get your CSV files:
              <ul>
                <li>Go to <a href="https://globalweather.tamu.edu/" target="_blank">Global Weather Data for SWAT</a>.</li>
                <li>Select a valid area range on the map.</li>
                <li>Select a date range (within the same year, preferably the whole year).</li>
                <li>Select all available variables.</li>
                <li>Select to generate CSV files.</li>
                <li>Enter your email address.</li>
                <li>Click the submit request button</li>
                <li>A Zip file should be sent to your given email address shortly.</li>
                <li>Unzip the received ZIP file, which would give a directory that contains multiple CSV files.</li>
              </ul>
            </ion-card-content>
          </ion-card>
          <ion-card>
            <ion-card-header>
              <ion-card-title>Step 2</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              Please click below button and select the directory that contains the CSV files in the directory picker.
              <br />
              Note: The browser might ask you for the permission of directory access, please approve it.
              <br />
              <ion-button
                onClick={async () => {
                  this.dataDirectoryHandle = await (window as any).showDirectoryPicker();

                  this.outputFileHandle = undefined;
                  this.totalFileCount = 0;
                  this.processedFileCount = 0;
                }}
              >Select Data Directory</ion-button>
              {
                this.dataDirectoryHandle &&
                <ion-text>You have chosen <ion-text color="primary">{this.dataDirectoryHandle.name}/</ion-text>.</ion-text>
              }
            </ion-card-content>
          </ion-card>
          <ion-card disabled={!this.dataDirectoryHandle}>
            <ion-card-header>
              <ion-card-title>Step 3</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              Please click below button and select where the processed database file to be saved.
              <br />
              Note: The browser might ask you for the permission of file access, please approve it.
              <br />
              <ion-button
                disabled={!this.dataDirectoryHandle}
                onClick={async () => {
                  const options = {
                    types: [
                      {
                        description: 'SQLite Database File',
                        accept: {
                          'application/x-sqlite3': ['.db'],
                        },
                      },
                    ],
                  };
                  this.outputFileHandle = await (window as any).showSaveFilePicker(options);

                  this.totalFileCount = 0;
                  this.processedFileCount = 0;
                }}
              >Select Save Path</ion-button>
              {
                this.outputFileHandle &&
                <ion-text>You are saving the output as <ion-text color="primary">{this.outputFileHandle.name}/</ion-text>.</ion-text>
              }
            </ion-card-content>
          </ion-card>
          <ion-card disabled={!(this.dataDirectoryHandle && this.outputFileHandle)}>
            <ion-card-header>
              <ion-card-title>Step 4</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              Please click below button to start data processing.
              <br />
              <ion-button
                disabled={!(this.dataDirectoryHandle && this.outputFileHandle)}
                onClick={async () => {
                  const databaseName = 'weather';
                  const variables = [
                    'Date',
                    'Longitude',
                    'Latitude',
                    'Elevation',
                    'Max Temperature',
                    'Min Temperature',
                    'Precipitation',
                    'Wind',
                    'Relative Humidity',
                    'Solar'
                  ];

                  const DB = new this.SQL.Database();
                  DB.run(
                    `CREATE TEMPORARY TABLE IF NOT EXISTS ${databaseName}_temp (` +
                    variables.map(variable => `${variable.replace(/\s/g, '')} ${variable === 'Date' ? 'VARCHAR' : 'FLOAT'},`).join(' ') + ' ' +
                    'PRIMARY KEY(Date, Latitude, Longitude)' +
                    ')'
                  );

                  let totalFileCount = 0;
                  for await (const _ of this.dataDirectoryHandle?.values()) {
                    totalFileCount++;
                  }
                  this.totalFileCount = totalFileCount;

                  for await (const fileHandle of this.dataDirectoryHandle?.values()) {
                    const fileNameSplit = (fileHandle.name as string).split('.');
                    const fileExtension = fileNameSplit[fileNameSplit.length - 1];
                    if (fileNameSplit?.length > 1 && fileExtension.toLowerCase() === 'csv') {
                      const file = await fileHandle.getFile() as File;
                      const fileContent = await file.text();
                      const data = d3.csvParse(fileContent);
                      for (const datum of data) {
                        DB.run(
                          `INSERT INTO ${databaseName}_temp VALUES (${variables.map(() => '?').join(', ')})`,
                          variables.map(variable => variable === 'Date' ? new Date(datum[variable]).toISOString().slice(0, 10) : datum[variable])
                        );
                      }
                    }

                    this.processedFileCount++;
                  }
                  
                  DB.run(
                    `CREATE TABLE IF NOT EXISTS ${databaseName} (` +
                    variables.map(variable => `${variable.replace(/\s/g, '')} ${variable === 'Date' ? 'VARCHAR' : 'FLOAT'},`).join(' ') + ' ' +
                    'PRIMARY KEY(Date, Latitude, Longitude)' +
                    ')'
                  );
                  DB.run(
                    `INSERT INTO ${databaseName} ` +
                    `SELECT SUBSTR(Date, 0, 8) AS Date, ${variables.filter(variable => variable !== 'Date').map(variable => variable === 'Precipitation' ? `SUM(${variable}) AS ${variable}` : `AVG(${variable.replace(/\s/g, '')}) AS ${variable.replace(/\s/g, '')}`).join(', ')} ` +
                    `FROM ${databaseName}_temp ` +
                    `GROUP BY SUBSTR(Date, 0, 8), Latitude, Longitude`
                    );
                  
                  const outputFileWritableStream = await this.outputFileHandle.createWritable();
                  const DBData = DB.export();
                  await outputFileWritableStream.write(DBData);
                  await outputFileWritableStream.close();

                  const finishAlert = await alertController.create({
                    header: 'Data Processing Finished',
                    message: `The CSV files from ${this.dataDirectoryHandle.name}/ has been processed and the output has been saved as ${this.outputFileHandle.name}.`,
                    buttons: ['OK']
                  });
                  await finishAlert.present();
                }}
              >Process</ion-button>
              <br />
              {
                this.totalFileCount > 0 &&
                <ion-progress-bar value={this.processedFileCount / this.totalFileCount}></ion-progress-bar>
              }
            </ion-card-content>
          </ion-card>
        </ion-content>
      </Host >
    );
  }

}
