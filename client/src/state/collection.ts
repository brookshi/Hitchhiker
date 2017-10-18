import { DtoCollectionWithRecord } from '../../../api/interfaces/dto_collection';
import { DtoRecord } from '../../../api/interfaces/dto_record';
import { RunResult } from '../../../api/interfaces/dto_run_result';
import { StringUtil } from '../utils/string_util';
import { RecordCategory } from '../common/record_category';
import { requestStateDefaultValue, RequestState } from './request';
import { allProject, newRecordFlag, newRequestName, allParameter } from '../common/constants';
import { ParameterType } from '../common/parameter_type';
import { RequestStatus } from '../common/request_status';
import { ConflictType } from '../common/conflict_type';

export function getDefaultRecord(isInit: boolean = false): DtoRecord {
    return {
        id: isInit ? newRecordFlag : `${newRecordFlag}${StringUtil.generateUID()}`,
        category: RecordCategory.record,
        name: newRequestName,
        collectionId: '',
        parameterType: ParameterType.ManyToMany,
        headers: []
    };
}

export const getNewRecordState: () => RecordState = () => {
    const newRecord = getDefaultRecord();
    return {
        name: newRecord.name || newRequestName,
        record: newRecord,
        isChanged: false,
        isRequesting: false,
        parameter: allParameter,
        conflictType: ConflictType.none
    };
};

export interface CollectionState {

    collectionsInfo: DtoCollectionWithRecord;

    openKeys: string[];

    selectedProject: string;

    fetchCollectionState: RequestState;
}

export interface DisplayRecordsState {

    activeKey: string;

    recordStates: _.Dictionary<RecordState>;

    recordsOrder: string[];

    responseState: ResponseState;
}

export interface RecordState {

    name: string;

    record: DtoRecord;

    isChanged: boolean;

    isRequesting: boolean;

    parameter: string;

    parameterStatus?: ParameterStatusState;

    conflictType: ConflictType;
}

export interface ParameterStatusState {

    [id: string]: RequestStatus;
}

export interface ResponseState {

    [id: string]: { runResult: RunResult } | ResponseState;
}

export const collectionDefaultValue: CollectionState = {
    fetchCollectionState: requestStateDefaultValue,
    openKeys: [],
    selectedProject: allProject,
    collectionsInfo: {
        collections: {},
        records: {}
    }
};

export const displayRecordsDefaultValue: DisplayRecordsState = {
    activeKey: newRecordFlag,
    recordsOrder: [newRecordFlag],
    recordStates:
    {
        [newRecordFlag]: {
            name: newRequestName,
            record: getDefaultRecord(true),
            isChanged: false,
            isRequesting: false,
            parameter: allParameter,
            conflictType: ConflictType.none
        }
    },
    responseState: {}
};