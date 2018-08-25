import { DtoCollectionWithRecord } from '../common/interfaces/dto_collection';
import { DtoRecord } from '../common/interfaces/dto_record';
import { RunResult } from '../common/interfaces/dto_run_result';
import { StringUtil } from '../utils/string_util';
import { RecordCategory } from '../misc/record_category';
import { requestStateDefaultValue, RequestState } from './request';
import { allProject, newRecordFlag, newRequestName, allParameter } from '../misc/constants';
import { ParameterType } from '../misc/parameter_type';
import { RequestStatus } from '../misc/request_status';
import { ConflictType } from '../misc/conflict_type';
import * as _ from 'lodash';

export function getDefaultRecord(isInit: boolean = false): DtoRecord {
    return {
        id: isInit ? newRecordFlag : `${newRecordFlag}${StringUtil.generateUID()}`,
        category: RecordCategory.record,
        name: newRequestName(),
        collectionId: '',
        parameterType: ParameterType.ManyToMany,
        headers: []
    };
}

export const getNewRecordState: () => RecordState = () => {
    const newRecord = getDefaultRecord();
    return {
        name: newRecord.name || newRequestName(),
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

    notShowConflict?: boolean;
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
            name: newRequestName(),
            record: getDefaultRecord(true),
            isChanged: false,
            isRequesting: false,
            parameter: allParameter,
            conflictType: ConflictType.none
        }
    },
    responseState: {}
};