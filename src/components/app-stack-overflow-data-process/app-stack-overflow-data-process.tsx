import { alertController } from '@ionic/core';
import { Component, Host, h, ComponentInterface, State } from '@stencil/core';
import initSqlJs from 'sql.js';
import { SqlJs } from 'sql.js/module';
import * as d3 from 'd3';

@Component({
  tag: 'app-stack-overflow-data-process',
  styleUrl: 'app-stack-overflow-data-process.css',
  scoped: true,
})
export class AppWeatherDataProcess implements ComponentInterface {

  private SQL: SqlJs.SqlJsStatic;

  @State() dataFileHandle: any;
  @State() outputFileHandle: any;
  @State() totalLineCount: number = 0;
  @State() processedLineCount: number = 0;

  async connectedCallback() {
    this.SQL = await initSqlJs({ locateFile: fileName => `./assets/sql.js/${fileName}` });
  }

  render() {
    return (
      <Host>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Step 1</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-button
              onClick={async () => {
                this.dataFileHandle = (await (window as any).showOpenFilePicker())?.[0];

                this.outputFileHandle = undefined;
                this.totalLineCount = 0;
                this.processedLineCount = 0;
              }}
            >Select Data File</ion-button>
            {
              this.dataFileHandle &&
              <ion-text>You have chosen <ion-text color="primary">{this.dataFileHandle.name}</ion-text>.</ion-text>
            }
          </ion-card-content>
        </ion-card>
        <ion-card disabled={!this.dataFileHandle}>
          <ion-card-header>
            <ion-card-title>Step 3</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            Please click below button and select where the processed database file to be saved.
                  <br />
                  Note: The browser might ask you for the permission of file access, please approve it.
                  <br />
            <ion-button
              disabled={!this.dataFileHandle}
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

                this.totalLineCount = 0;
                this.processedLineCount = 0;
              }}
            >Select Save Path</ion-button>
            {
              this.outputFileHandle &&
              <ion-text>You are saving the output as <ion-text color="primary">{this.outputFileHandle.name}</ion-text>.</ion-text>
            }
          </ion-card-content>
        </ion-card>
        <ion-card disabled={!(this.dataFileHandle && this.outputFileHandle)}>
          <ion-card-header>
            <ion-card-title>Step 4</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            Please click below button to start data processing.
                  <br />
            <ion-button
              disabled={!(this.dataFileHandle && this.outputFileHandle)}
              onClick={async () => {
                const databaseName = 'stackoverflow';

                const DB = new this.SQL.Database();
                DB.run(
                  `CREATE TABLE IF NOT EXISTS ${databaseName} (` +
                  'UserId VARCHAR, Tech VARCHAR, Year INT(4), Location VARCHAR' +
                  ')'
                );

                const file = await this.dataFileHandle.getFile() as File;
                const fileContent = await file.text();
                const data = d3.csvParse(fileContent);
                const years = data.columns.slice(4);
                const trimmedData = data.filter(d => d['Id']);
                this.totalLineCount = trimmedData.length;

                for (const datum of trimmedData) {
                  const location = await this.getCountryName(datum['location']);
                  for (const year of years) {
                    const techs = datum[year] && datum[year].split(' ');
                    if (techs) {
                      for (const tech of techs) {
                        DB.run(
                          `INSERT INTO ${databaseName} VALUES (?, ?, ?, ?)`,
                          [
                            datum['developerName'],
                            tech,
                            year,
                            location || ''
                          ]
                        );
                      }
                    }
                  }

                  this.processedLineCount++;
                }
                const outputFileWritableStream = await this.outputFileHandle.createWritable();
                const DBData = DB.export();
                await outputFileWritableStream.write(DBData);
                await outputFileWritableStream.close();

                const finishAlert = await alertController.create({
                  header: 'Data Processing Finished',
                  message: `${this.dataFileHandle.name} has been processed and the output has been saved as ${this.outputFileHandle.name}.`,
                  buttons: ['OK']
                });
                await finishAlert.present();
              }}
            >Process</ion-button>
            <br />
            {
              this.totalLineCount > 0 &&
              <ion-progress-bar value={this.processedLineCount / this.totalLineCount}></ion-progress-bar>
            }
          </ion-card-content>
        </ion-card>
      </Host>
    );
  }

  private async getCountryName(location: string) {
    const apiKey = '8nOXyBt8c8NSxaqt0IAFMVyEPNJ0amSF';
    const response = await fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=${apiKey}&inFormat=kvp&outFormat=json&location=${location}&thumbMaps=false`);
    const result = await response.json();
    return result?.results?.[0]?.locations?.[0]?.adminArea1;
  }

}
