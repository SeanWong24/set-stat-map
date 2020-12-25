export declare type ParallelSetsDataRecord = { [dimensionName: string]: string | number };

export declare type SortingHandler = (a: number | string, b: number | string) => number;

export class ParallelSetsDataNode {
    valueHistory: (string | number)[] = [];
    dataRecords: ParallelSetsDataRecord[] = [];
    axisSegmentPosition: [number, number] = [0, 0];
    autoMergedAxisSegmentAdjustmentRatio: number = 0;
    adjustmentRatio: number = 1;

    private _adjustedAxisSegmentPosition?: [number, number];
    get adjustedAxisSegmentPosition() {
        return this._adjustedAxisSegmentPosition || this.axisSegmentPosition;
    }
    set adjustedAxisSegmentPosition(value) {
        this._adjustedAxisSegmentPosition = value;
    }
}