import { Config } from '@stencil/core';
import nodePolyfills from 'rollup-plugin-node-polyfills';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalScript: 'src/global/app.ts',
  globalStyle: 'src/global/app.css',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      copy: [
        { src: '../node_modules/sql.js/dist/sql-wasm.wasm', dest: 'assets/sql.js/sql-wasm.wasm' }
      ]
    }
  ],
  rollupPlugins: {
    after: [
      nodePolyfills()
    ]
  },
};
