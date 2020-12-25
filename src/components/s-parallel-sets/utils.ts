export declare type ParallelSetsDataRecord = { [dimensionName: string]: string | number };

export declare type SortingHandler = (a: number | string, b: number | string) => number;

export class ParallelSetsDataNode {
    valueHistory: (string | number)[] = [];
    dataRecords: ParallelSetsDataRecord[] = [];
    segmentPosition: [number, number] = [0, 0];
    autoMergedAxisSegmentAdjustmentRatio: number = 0;
    adjustmentRatio: number = 1;

    private _adjustedSegmentPosition?: [number, number];
    get adjustedSegmentPosition() {
        return this._adjustedSegmentPosition || this.segmentPosition;
    }
    set adjustedSegmentPosition(value) {
        this._adjustedSegmentPosition = value;
    }
}