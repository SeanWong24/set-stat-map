/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { ParallelSetsDataNode, ParallelSetsDataRecord, ParallelSetsDimensionValueSortingHandler, ParallelSetsOnLoadDetail } from "./components/s-parallel-sets/utils";
import { StatisticsColumnsVisType } from "./components/s-statistics-columns/utils";
export namespace Components {
    interface AppDataProcess {
        "datasetType": string;
    }
    interface AppHome {
    }
    interface AppMapView {
        "centerPoint": [number, number];
        "datasetRange": {
    minLatitude: number,
    maxLatitude: number,
    minLongitude: number,
    maxLongitude: number
  };
        "header": string;
        "headerTextColor": string;
        "headerTextSize": number;
        "headerTextWeight": string;
        "heatmapData": {
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
        "heatmapHighlightOpacity": number;
        "heatmapOpacity": number;
        "zoom": number;
    }
    interface AppRoot {
    }
    interface AppWeatherVis {
    }
    interface SBoxPlotItem {
        "boxFill": string;
        "boxStroke": string;
        "connectionLineStroke": string;
        "enableTooltip": boolean;
        "maxLineStroke": string;
        "medianLineStroke": string;
        "minLineStroke": string;
        "orientation": 'horizontal' | 'vertical';
        "scaleMaxValue": number;
        "scaleMinValue": number;
        "values": number[];
    }
    interface SParallelSets {
        "autoMergedAxisSegmentMaxRatio": number;
        "autoMergedAxisSegmentName": string | { [dimensionName: string]: string | number };
        "axisBoxFill": string;
        "axisBoxWidth": number;
        "axisFooter": string | { [dimensionName: string]: string };
        "axisFooterTextColor": string | { [dimensionName: string]: string };
        "axisFooterTextSize": number;
        "axisFooterTextWeight": string | { [dimensionName: string]: string };
        "axisHeaderTextColor": string | { [dimensionName: string]: string };
        "axisHeaderTextSize": number;
        "axisHeaderTextWeight": string | { [dimensionName: string]: string };
        "axisSegmentTextColor": string;
        "axisStrokeWidth": number;
        "colorScheme": string[];
        "data": ParallelSetsDataRecord[];
        "defineTexturesHandler": (textureGenerator: any) => (() => any)[];
        "dimensionDisplyedNameDict": { [dimensionName: string]: string };
        "dimensionValueSortingMethods": ParallelSetsDimensionValueSortingHandler | { [dimensionName: string]: ParallelSetsDimensionValueSortingHandler };
        "dimensions": string[];
        "maxAxisSegmentCount": number | { [dimensionName: string]: number };
        "maxAxisSegmentMarginRatioAllowed": number;
        "minimumRatioToShowAxisText": number;
        "ribbonHighlightOpacity": number;
        "ribbonOpacity": number;
        "ribbonTension": number;
        "sideMargin": number;
    }
    interface SSetStat {
        "colorScheme": string[];
        "data": any[];
        "defineTexturesHandler": (textureGenerator: any) => (() => any)[];
        "dimensionDisplyedNameDict": { [dimensionName: string]: string };
        "headerTextColor": string | { [dimensionName: string]: string };
        "headerTextSize": number;
        "headerTextWeight": string | { [dimensionName: string]: string };
        "parallelSetsAutoMergedAxisSegmentMaxRatio": number;
        "parallelSetsAutoMergedAxisSegmentName": string | { [dimensionName: string]: string };
        "parallelSetsDimensionValueSortingMethods": ParallelSetsDimensionValueSortingHandler | { [dimensionName: string]: ParallelSetsDimensionValueSortingHandler };
        "parallelSetsDimensions": string[];
        "parallelSetsFooter": string | { [dimensionName: string]: string };
        "parallelSetsMaxAxisSegmentCount": number | { [dimensionName: string]: number };
        "parallelSetsRibbonTension": number;
        "parallelSetsWidth": string;
        "reorderParallelSetsLastAxisByDimension": (dimensionName?: string, orderBy?: 'ascending' | 'descending') => Promise<ParallelSetsDimensionValueSortingHandler | { [dimensionName: string]: ParallelSetsDimensionValueSortingHandler; }>;
        "ribbonAndRowHighlightOpacity": number;
        "ribbonAndRowOpacity": number;
        "statisticsColumnDefinitions": { dimensionName: string, visType: StatisticsColumnsVisType }[];
        "statisticsColumnsWidth": string;
    }
    interface SStatisticsColumn {
        "data": { [rowValue: string]: number[] };
        "footerAxisHeight": number;
        "header": string;
        "headerTextColor": string;
        "headerTextSize": number;
        "headerTextWeight": string;
        "rowHighlightOpacity": number;
        "rowOpacity": number;
        "rowValueAndBackgroundDict": {
    [value: string]: {
      backgroundColor: string;
      backgroundImage: string;
    }
  };
        "rowValueAndPositionDict": {
    [value: string]: {
      minSegmentPosition: number;
      maxSegmentPosition: number;
    }
  };
    }
    interface SStatisticsColumns {
        "data": any[];
        "dimensionDisplyedNameDict": { [dimensionName: string]: string };
        "footerAxisHeight": number;
        "headerTextColor": string | { [dimensionName: string]: string };
        "headerTextSize": number;
        "headerTextWeight": string | { [dimensionName: string]: string };
        "rowHighlightOpacity": number;
        "rowOpacity": number;
        "rowValueAndBackgroundDict": {
    [value: string]: {
      backgroundColor: string;
      backgroundImage: string;
    }
  };
        "rowValueAndPositionDict": {
    [value: string]: {
      minSegmentPosition: number;
      maxSegmentPosition: number;
    }
  };
        "rowValueDimensionName": string;
        "statisticsColumnDefinitions": { dimensionName: string, visType: StatisticsColumnsVisType }[];
    }
}
declare global {
    interface HTMLAppDataProcessElement extends Components.AppDataProcess, HTMLStencilElement {
    }
    var HTMLAppDataProcessElement: {
        prototype: HTMLAppDataProcessElement;
        new (): HTMLAppDataProcessElement;
    };
    interface HTMLAppHomeElement extends Components.AppHome, HTMLStencilElement {
    }
    var HTMLAppHomeElement: {
        prototype: HTMLAppHomeElement;
        new (): HTMLAppHomeElement;
    };
    interface HTMLAppMapViewElement extends Components.AppMapView, HTMLStencilElement {
    }
    var HTMLAppMapViewElement: {
        prototype: HTMLAppMapViewElement;
        new (): HTMLAppMapViewElement;
    };
    interface HTMLAppRootElement extends Components.AppRoot, HTMLStencilElement {
    }
    var HTMLAppRootElement: {
        prototype: HTMLAppRootElement;
        new (): HTMLAppRootElement;
    };
    interface HTMLAppWeatherVisElement extends Components.AppWeatherVis, HTMLStencilElement {
    }
    var HTMLAppWeatherVisElement: {
        prototype: HTMLAppWeatherVisElement;
        new (): HTMLAppWeatherVisElement;
    };
    interface HTMLSBoxPlotItemElement extends Components.SBoxPlotItem, HTMLStencilElement {
    }
    var HTMLSBoxPlotItemElement: {
        prototype: HTMLSBoxPlotItemElement;
        new (): HTMLSBoxPlotItemElement;
    };
    interface HTMLSParallelSetsElement extends Components.SParallelSets, HTMLStencilElement {
    }
    var HTMLSParallelSetsElement: {
        prototype: HTMLSParallelSetsElement;
        new (): HTMLSParallelSetsElement;
    };
    interface HTMLSSetStatElement extends Components.SSetStat, HTMLStencilElement {
    }
    var HTMLSSetStatElement: {
        prototype: HTMLSSetStatElement;
        new (): HTMLSSetStatElement;
    };
    interface HTMLSStatisticsColumnElement extends Components.SStatisticsColumn, HTMLStencilElement {
    }
    var HTMLSStatisticsColumnElement: {
        prototype: HTMLSStatisticsColumnElement;
        new (): HTMLSStatisticsColumnElement;
    };
    interface HTMLSStatisticsColumnsElement extends Components.SStatisticsColumns, HTMLStencilElement {
    }
    var HTMLSStatisticsColumnsElement: {
        prototype: HTMLSStatisticsColumnsElement;
        new (): HTMLSStatisticsColumnsElement;
    };
    interface HTMLElementTagNameMap {
        "app-data-process": HTMLAppDataProcessElement;
        "app-home": HTMLAppHomeElement;
        "app-map-view": HTMLAppMapViewElement;
        "app-root": HTMLAppRootElement;
        "app-weather-vis": HTMLAppWeatherVisElement;
        "s-box-plot-item": HTMLSBoxPlotItemElement;
        "s-parallel-sets": HTMLSParallelSetsElement;
        "s-set-stat": HTMLSSetStatElement;
        "s-statistics-column": HTMLSStatisticsColumnElement;
        "s-statistics-columns": HTMLSStatisticsColumnsElement;
    }
}
declare namespace LocalJSX {
    interface AppDataProcess {
        "datasetType"?: string;
    }
    interface AppHome {
    }
    interface AppMapView {
        "centerPoint"?: [number, number];
        "datasetRange"?: {
    minLatitude: number,
    maxLatitude: number,
    minLongitude: number,
    maxLongitude: number
  };
        "header"?: string;
        "headerTextColor"?: string;
        "headerTextSize"?: number;
        "headerTextWeight"?: string;
        "heatmapData"?: {
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
        "heatmapHighlightOpacity"?: number;
        "heatmapOpacity"?: number;
        "onMouseDraw"?: (event: CustomEvent<{
    minLatitude: number,
    maxLatitude: number,
    minLongitude: number,
    maxLongitude: number
  }>) => void;
        "zoom"?: number;
    }
    interface AppRoot {
    }
    interface AppWeatherVis {
    }
    interface SBoxPlotItem {
        "boxFill"?: string;
        "boxStroke"?: string;
        "connectionLineStroke"?: string;
        "enableTooltip"?: boolean;
        "maxLineStroke"?: string;
        "medianLineStroke"?: string;
        "minLineStroke"?: string;
        "onItemLoad"?: (event: CustomEvent<{ min: number, q1: number, median: number, q3: number, max: number }>) => void;
        "orientation"?: 'horizontal' | 'vertical';
        "scaleMaxValue"?: number;
        "scaleMinValue"?: number;
        "values"?: number[];
    }
    interface SParallelSets {
        "autoMergedAxisSegmentMaxRatio"?: number;
        "autoMergedAxisSegmentName"?: string | { [dimensionName: string]: string | number };
        "axisBoxFill"?: string;
        "axisBoxWidth"?: number;
        "axisFooter"?: string | { [dimensionName: string]: string };
        "axisFooterTextColor"?: string | { [dimensionName: string]: string };
        "axisFooterTextSize"?: number;
        "axisFooterTextWeight"?: string | { [dimensionName: string]: string };
        "axisHeaderTextColor"?: string | { [dimensionName: string]: string };
        "axisHeaderTextSize"?: number;
        "axisHeaderTextWeight"?: string | { [dimensionName: string]: string };
        "axisSegmentTextColor"?: string;
        "axisStrokeWidth"?: number;
        "colorScheme"?: string[];
        "data"?: ParallelSetsDataRecord[];
        "defineTexturesHandler"?: (textureGenerator: any) => (() => any)[];
        "dimensionDisplyedNameDict"?: { [dimensionName: string]: string };
        "dimensionValueSortingMethods"?: ParallelSetsDimensionValueSortingHandler | { [dimensionName: string]: ParallelSetsDimensionValueSortingHandler };
        "dimensions"?: string[];
        "maxAxisSegmentCount"?: number | { [dimensionName: string]: number };
        "maxAxisSegmentMarginRatioAllowed"?: number;
        "minimumRatioToShowAxisText"?: number;
        "onAxisHeaderClick"?: (event: CustomEvent<{ dimensionName: string, dataNodes: ParallelSetsDataNode[] }>) => void;
        "onAxisHeaderContextMenu"?: (event: CustomEvent<{ dimensionName: string, dataNodes: ParallelSetsDataNode[] }>) => void;
        "onAxisHeaderMouseOut"?: (event: CustomEvent<{ dimensionName: string, dataNodes: ParallelSetsDataNode[] }>) => void;
        "onAxisHeaderMouseOver"?: (event: CustomEvent<{ dimensionName: string, dataNodes: ParallelSetsDataNode[] }>) => void;
        "onAxisSegmentClick"?: (event: CustomEvent<{ dimensionName: string, value: string | number, count: number, proportion: number, dataNodes: ParallelSetsDataNode[] }>) => void;
        "onAxisSegmentContextMenu"?: (event: CustomEvent<{ dimensionName: string, value: string | number, count: number, proportion: number, dataNodes: ParallelSetsDataNode[] }>) => void;
        "onAxisSegmentMouseOut"?: (event: CustomEvent<{ dimensionName: string, value: string | number, count: number, proportion: number, dataNodes: ParallelSetsDataNode[] }>) => void;
        "onAxisSegmentMouseOver"?: (event: CustomEvent<{ dimensionName: string, value: string | number, count: number, proportion: number, dataNodes: ParallelSetsDataNode[] }>) => void;
        "onRibbonClick"?: (event: CustomEvent<{ dimensions: string[], valueHistory: (string | number)[], count: number, proportion: number, dataNode: ParallelSetsDataNode }>) => void;
        "onRibbonContextMenu"?: (event: CustomEvent<{ dimensions: string[], valueHistory: (string | number)[], count: number, proportion: number, dataNode: ParallelSetsDataNode }>) => void;
        "onRibbonMouseOut"?: (event: CustomEvent<{ dimensions: string[], valueHistory: (string | number)[], count: number, proportion: number, dataNode: ParallelSetsDataNode }>) => void;
        "onRibbonMouseOver"?: (event: CustomEvent<{ dimensions: string[], valueHistory: (string | number)[], count: number, proportion: number, dataNode: ParallelSetsDataNode }>) => void;
        "onVisLoad"?: (event: CustomEvent<ParallelSetsOnLoadDetail>) => void;
        "ribbonHighlightOpacity"?: number;
        "ribbonOpacity"?: number;
        "ribbonTension"?: number;
        "sideMargin"?: number;
    }
    interface SSetStat {
        "colorScheme"?: string[];
        "data"?: any[];
        "defineTexturesHandler"?: (textureGenerator: any) => (() => any)[];
        "dimensionDisplyedNameDict"?: { [dimensionName: string]: string };
        "headerTextColor"?: string | { [dimensionName: string]: string };
        "headerTextSize"?: number;
        "headerTextWeight"?: string | { [dimensionName: string]: string };
        "onParallelSetsAxisSegmentClick"?: (event: CustomEvent<{ dimensionName: string, value: string | number, count: number, proportion: number, dataNodes: ParallelSetsDataNode[] }>) => void;
        "onStatisticsColumnsHeaderClick"?: (event: CustomEvent<string>) => void;
        "onVisLoad"?: (event: CustomEvent<ParallelSetsOnLoadDetail>) => void;
        "onVisWillRender"?: (event: CustomEvent<any>) => void;
        "parallelSetsAutoMergedAxisSegmentMaxRatio"?: number;
        "parallelSetsAutoMergedAxisSegmentName"?: string | { [dimensionName: string]: string };
        "parallelSetsDimensionValueSortingMethods"?: ParallelSetsDimensionValueSortingHandler | { [dimensionName: string]: ParallelSetsDimensionValueSortingHandler };
        "parallelSetsDimensions"?: string[];
        "parallelSetsFooter"?: string | { [dimensionName: string]: string };
        "parallelSetsMaxAxisSegmentCount"?: number | { [dimensionName: string]: number };
        "parallelSetsRibbonTension"?: number;
        "parallelSetsWidth"?: string;
        "ribbonAndRowHighlightOpacity"?: number;
        "ribbonAndRowOpacity"?: number;
        "statisticsColumnDefinitions"?: { dimensionName: string, visType: StatisticsColumnsVisType }[];
        "statisticsColumnsWidth"?: string;
    }
    interface SStatisticsColumn {
        "data"?: { [rowValue: string]: number[] };
        "footerAxisHeight"?: number;
        "header"?: string;
        "headerTextColor"?: string;
        "headerTextSize"?: number;
        "headerTextWeight"?: string;
        "onHeaderClick"?: (event: CustomEvent<string>) => void;
        "rowHighlightOpacity"?: number;
        "rowOpacity"?: number;
        "rowValueAndBackgroundDict"?: {
    [value: string]: {
      backgroundColor: string;
      backgroundImage: string;
    }
  };
        "rowValueAndPositionDict"?: {
    [value: string]: {
      minSegmentPosition: number;
      maxSegmentPosition: number;
    }
  };
    }
    interface SStatisticsColumns {
        "data"?: any[];
        "dimensionDisplyedNameDict"?: { [dimensionName: string]: string };
        "footerAxisHeight"?: number;
        "headerTextColor"?: string | { [dimensionName: string]: string };
        "headerTextSize"?: number;
        "headerTextWeight"?: string | { [dimensionName: string]: string };
        "onColumnHeaderClick"?: (event: CustomEvent<string>) => void;
        "rowHighlightOpacity"?: number;
        "rowOpacity"?: number;
        "rowValueAndBackgroundDict"?: {
    [value: string]: {
      backgroundColor: string;
      backgroundImage: string;
    }
  };
        "rowValueAndPositionDict"?: {
    [value: string]: {
      minSegmentPosition: number;
      maxSegmentPosition: number;
    }
  };
        "rowValueDimensionName"?: string;
        "statisticsColumnDefinitions"?: { dimensionName: string, visType: StatisticsColumnsVisType }[];
    }
    interface IntrinsicElements {
        "app-data-process": AppDataProcess;
        "app-home": AppHome;
        "app-map-view": AppMapView;
        "app-root": AppRoot;
        "app-weather-vis": AppWeatherVis;
        "s-box-plot-item": SBoxPlotItem;
        "s-parallel-sets": SParallelSets;
        "s-set-stat": SSetStat;
        "s-statistics-column": SStatisticsColumn;
        "s-statistics-columns": SStatisticsColumns;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "app-data-process": LocalJSX.AppDataProcess & JSXBase.HTMLAttributes<HTMLAppDataProcessElement>;
            "app-home": LocalJSX.AppHome & JSXBase.HTMLAttributes<HTMLAppHomeElement>;
            "app-map-view": LocalJSX.AppMapView & JSXBase.HTMLAttributes<HTMLAppMapViewElement>;
            "app-root": LocalJSX.AppRoot & JSXBase.HTMLAttributes<HTMLAppRootElement>;
            "app-weather-vis": LocalJSX.AppWeatherVis & JSXBase.HTMLAttributes<HTMLAppWeatherVisElement>;
            "s-box-plot-item": LocalJSX.SBoxPlotItem & JSXBase.HTMLAttributes<HTMLSBoxPlotItemElement>;
            "s-parallel-sets": LocalJSX.SParallelSets & JSXBase.HTMLAttributes<HTMLSParallelSetsElement>;
            "s-set-stat": LocalJSX.SSetStat & JSXBase.HTMLAttributes<HTMLSSetStatElement>;
            "s-statistics-column": LocalJSX.SStatisticsColumn & JSXBase.HTMLAttributes<HTMLSStatisticsColumnElement>;
            "s-statistics-columns": LocalJSX.SStatisticsColumns & JSXBase.HTMLAttributes<HTMLSStatisticsColumnsElement>;
        }
    }
}
