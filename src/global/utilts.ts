import { EventEmitter } from "@stencil/core";

export interface AppVisComponent {
    controlPanelRenderHandlerUpdated: EventEmitter<() => any>
}

export const visRouteAndDisplayNameDict = {
    'weather': 'Weather',
    'airbnb': 'AirBnb',
    'stack-overflow': 'StackOverflow'
};