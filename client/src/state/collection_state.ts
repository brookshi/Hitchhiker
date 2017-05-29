import { DtoCollectionWithRecord } from '../../../api/interfaces/dto_collection';
import { DtoRecord } from '../../../api/interfaces/dto_record';
import { RunResult } from '../../../api/interfaces/dto_run_result';
import { StringUtil } from '../utils/string_util';
import { RecordCategory } from '../common/record_category';

export function getDefaultRecord(isInit: boolean = false): DtoRecord {
    return {
        id: isInit ? '@new' : `@new${StringUtil.generateUID()}`,
        category: RecordCategory.record,
        name: 'new request',
        collectionId: '',
        headers: []
    };
}

export interface CollectionState {

    collectionsInfo: DtoCollectionWithRecord;

    isLoaded: boolean;
}

export interface DisplayRecordsState {

    activeKey: string;

    recordStates: RecordState[];

    responseState: ResponseState;
}

export interface RecordState {

    name: string;

    record: DtoRecord;

    isChanged: boolean;

    isRequesting: boolean;
}

export interface ResponseState {

    [id: string]: RunResult;
}

export const collectionDefaultValue: CollectionState = {
    isLoaded: false,
    collectionsInfo: {
        collections: {},
        records: {}
    }
};

export const displayRecordsDefaultValue: DisplayRecordsState = {
    activeKey: '@new',
    recordStates: [
        {
            name: 'new request',
            record: getDefaultRecord(true),
            isChanged: false,
            isRequesting: false
        }
    ],
    responseState: {}
};