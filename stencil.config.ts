import { Config } from '@stencil/core';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import copy from 'rollup-plugin-copy';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalScript: 'src/global/app.ts',
  globalStyle: 'src/global/app.css',
  taskQueue: 'async',
  outputTargets: [{
    type: 'www',
  }],
  rollupPlugins: {
    after: [
      nodePolyfills(),
      copy({
        targets: [
          {
            src: 'node_modules/sql.js/dist/sql-wasm.wasm', dest: 'www/assets/sql.js/'
          }
        ]
      })
    ]
  },
};
