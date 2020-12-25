/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { ParallelSetsDataNode, ParallelSetsDataRecord, SortingHandler } from "./components/s-parallel-sets/utils";
export namespace Components {
    interface AppHome {
    }
    interface AppRoot {
    }
    interface SParallelSets {
        "autoMergedAxisSegmentMaxRatio": number;
        "autoMergedAxisSegmentName": string | { [dimensionName: string]: string | number };
        "axisBoxFill": string;
        "axisBoxWidth": number;
        "axisHeaderTextColor": string;
        "axisHeaderTextSize": number;
        "axisHeaderTextWeight": string;
        "axisSegmentTextColor": string;
        "axisStrokeWidth": number;
        "colorScheme": string[];
        "data": ParallelSetsDataRecord[];
        "defineTexturesHandler": (textureGenerator: any) => (() => any)[];
        "dimensionValueSortingMethods": SortingHandler | { [dimensionName: string]: SortingHandler };
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
        "parallelSetsAutoMergedAxisSegmentMaxRatio": number;
        "parallelSetsAutoMergedAxisSegmentName": string | { [dimensionName: string]: string };
        "parallelSetsDimensions": string[];
        "parallelSetsMaxAxisSegmentCount": number | { [dimensionName: string]: number };
        "parallelSetsRibbonTension": number;
        "parallelSetsWidth": string;
        "statisticsColumnDefinitions": { dimensionName: string, visType: string }[];
        "statisticsColumnsWidth": string;
    }
    interface SStatisticsColumns {
        "data": any[];
        "statisticsColumnDefinitions": { dimensionName: string, visType: string }[];
    }
}
declare global {
    interface HTMLAppHomeElement extends Components.AppHome, HTMLStencilElement {
    }
    var HTMLAppHomeElement: {
        prototype: HTMLAppHomeElement;
        new (): HTMLAppHomeElement;
    };
    interface HTMLAppRootElement extends Components.AppRoot, HTMLStencilElement {
    }
    var HTMLAppRootElement: {
        prototype: HTMLAppRootElement;
        new (): HTMLAppRootElement;
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
    interface HTMLSStatisticsColumnsElement extends Components.SStatisticsColumns, HTMLStencilElement {
    }
    var HTMLSStatisticsColumnsElement: {
        prototype: HTMLSStatisticsColumnsElement;
        new (): HTMLSStatisticsColumnsElement;
    };
    interface HTMLElementTagNameMap {
        "app-home": HTMLAppHomeElement;
        "app-root": HTMLAppRootElement;
        "s-parallel-sets": HTMLSParallelSetsElement;
        "s-set-stat": HTMLSSetStatElement;
        "s-statistics-columns": HTMLSStatisticsColumnsElement;
    }
}
declare namespace LocalJSX {
    interface AppHome {
    }
    interface AppRoot {
    }
    interface SParallelSets {
        "autoMergedAxisSegmentMaxRatio"?: number;
        "autoMergedAxisSegmentName"?: string | { [dimensionName: string]: string | number };
        "axisBoxFill"?: string;
        "axisBoxWidth"?: number;
        "axisHeaderTextColor"?: string;
        "axisHeaderTextSize"?: number;
        "axisHeaderTextWeight"?: string;
        "axisSegmentTextColor"?: string;
        "axisStrokeWidth"?: number;
        "colorScheme"?: string[];
        "data"?: ParallelSetsDataRecord[];
        "defineTexturesHandler"?: (textureGenerator: any) => (() => any)[];
        "dimensionValueSortingMethods"?: SortingHandler | { [dimensionName: string]: SortingHandler };
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
        "ribbonHighlightOpacity"?: number;
        "ribbonOpacity"?: number;
        "ribbonTension"?: number;
        "sideMargin"?: number;
    }
    interface SSetStat {
        "colorScheme"?: string[];
        "data"?: any[];
        "defineTexturesHandler"?: (textureGenerator: any) => (() => any)[];
        "parallelSetsAutoMergedAxisSegmentMaxRatio"?: number;
        "parallelSetsAutoMergedAxisSegmentName"?: string | { [dimensionName: string]: string };
        "parallelSetsDimensions"?: string[];
        "parallelSetsMaxAxisSegmentCount"?: number | { [dimensionName: string]: number };
        "parallelSetsRibbonTension"?: number;
        "parallelSetsWidth"?: string;
        "statisticsColumnDefinitions"?: { dimensionName: string, visType: string }[];
        "statisticsColumnsWidth"?: string;
    }
    interface SStatisticsColumns {
        "data"?: any[];
        "statisticsColumnDefinitions"?: { dimensionName: string, visType: string }[];
    }
    interface IntrinsicElements {
        "app-home": AppHome;
        "app-root": AppRoot;
        "s-parallel-sets": SParallelSets;
        "s-set-stat": SSetStat;
        "s-statistics-columns": SStatisticsColumns;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "app-home": LocalJSX.AppHome & JSXBase.HTMLAttributes<HTMLAppHomeElement>;
            "app-root": LocalJSX.AppRoot & JSXBase.HTMLAttributes<HTMLAppRootElement>;
            "s-parallel-sets": LocalJSX.SParallelSets & JSXBase.HTMLAttributes<HTMLSParallelSetsElement>;
            "s-set-stat": LocalJSX.SSetStat & JSXBase.HTMLAttributes<HTMLSSetStatElement>;
            "s-statistics-columns": LocalJSX.SStatisticsColumns & JSXBase.HTMLAttributes<HTMLSStatisticsColumnsElement>;
        }
    }
}
