import { DtoRecord } from '../../api/interfaces/dto_record';
import { DtoCollectionWithRecord } from '../../api/interfaces/dto_collection';
import { DtoResUser } from '../../api/interfaces/dto_res';
import { StringUtil } from './utils/string_util';
import { RecordCategory } from './common/record_category';
import { RunResult } from '../../api/interfaces/dto_run_result';

export function getDefaultRecord(isInit: boolean = false): DtoRecord {
    return {
        id: isInit ? '@new' : `@new${StringUtil.generateUID()}`,
        category: RecordCategory.record,
        name: 'new request',
        collectionId: '',
        headers: []
    };
}

export interface RecordState {
    name: string;

    record: DtoRecord;

    isChanged: boolean;

    isRequesting: boolean;
}

export interface DisplayRecordsState {
    activeKey: string;

    recordState: RecordState[];

    responseState: ResponseState;
}

export interface ResponseState {
    [id: string]: RunResult;
}

export interface CollectionState {
    collectionsInfo: DtoCollectionWithRecord;

    isLoaded: boolean;
}

export interface UIState {
    collectionPanelWidth: number;
}

export interface UserInfoState {
    userInfo: DtoResUser;

    isLoaded: boolean;
}

export interface State {
    uiState: UIState;

    userState: UserInfoState;

    collectionState: CollectionState;

    displayRecordsState: DisplayRecordsState;

    // teamState: TeamState;

    // documentState: DocumentState;

    // mockState: MockState;

    // stressTestState: StressTestState;
}

export const initialState: State = {
    uiState: {
        collectionPanelWidth: 300
    },
    userState: {
        isLoaded: false,
        userInfo: {
            teams: []
        }
    },
    collectionState: {
        isLoaded: false,
        collectionsInfo: {
            collections: {},
            records: {}
        }
    },
    displayRecordsState: {
        activeKey: '@new',
        recordState: [
            {
                name: 'new request',
                record: getDefaultRecord(true),
                isChanged: false,
                isRequesting: false
            }
        ],
        responseState: {}
    },
};