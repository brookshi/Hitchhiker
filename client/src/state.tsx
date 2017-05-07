import { DtoResCollection, DtoResRecord } from '../../api/interfaces/dto_res';
import { DtoRecord } from '../../api/interfaces/dto_record';
import { StringUtil } from './utils/string_util';
import { RecordCategory } from './common/record_category';
import { RunResult } from '../../api/interfaces/dto_run_result';

export function getDefaultRecord(isInit: boolean = false): DtoRecord {
    return {
        id: isInit ? '@init' : StringUtil.generateUID(),
        category: RecordCategory.record,
        name: 'new request',
        collectionId: '',
        headers: []
    };
}

export interface CollectionsState {
    collections: DtoResCollection[];
    activeKey: string;
}

export interface ActiveRecordState {
    activeRecord: DtoRecord | DtoResRecord;
}

export interface ResponseState {
    [id: string]: RunResult | Error;
}

export interface State {
    collections: CollectionsState;
    activeRecord: ActiveRecordState;
    responses: ResponseState;
}

export const initialState: State = {
    collections: {
        collections: [],
        activeKey: ''
    },
    activeRecord: { activeRecord: getDefaultRecord(true) },
    responses: {}
};