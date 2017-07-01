import { DtoCollectionWithRecord } from '../../../api/interfaces/dto_collection';
import { DtoRecord } from '../../../api/interfaces/dto_record';
import { RunResult } from '../../../api/interfaces/dto_run_result';
import { StringUtil } from '../utils/string_util';
import { RecordCategory } from '../common/record_category';
import { requestStateDefaultValue, RequestState } from './index';

export function getDefaultRecord(isInit: boolean = false): DtoRecord {
    return {
        id: isInit ? '@new' : `@new${StringUtil.generateUID()}`,
        category: RecordCategory.record,
        name: 'new request',
        collectionId: '',
        headers: []
    };
}

export const AllProject = 'All';

export interface CollectionState {

    collectionsInfo: DtoCollectionWithRecord;

    openKeys: string[];

    selectedProject: string;

    fetchCollectionState: RequestState;
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
    fetchCollectionState: requestStateDefaultValue,
    openKeys: [],
    selectedProject: AllProject,
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