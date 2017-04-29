import { DtoResCollection, DtoResRecord } from '../../api/interfaces/dto_res';
import { DtoRecord } from '../../api/interfaces/dto_record';
import { StringUtil } from './utils/string_util';
import { RecordCategory } from './common/record_category';

export function getDefaultRecord(): DtoRecord {
    return {
        id: StringUtil.generateUID(),
        category: RecordCategory.record,
        name: 'new request',
        collectionId: ''
    };
}

export interface CollectionsState {
    collections: DtoResCollection[];
    activeKey: string;
}

export interface State {
    collectionsState: CollectionsState;
    activeRecord: DtoRecord | DtoResRecord;
}

export const initialState: State = {
    collectionsState: {
        collections: [],
        activeKey: ''
    },
    activeRecord: getDefaultRecord()
};