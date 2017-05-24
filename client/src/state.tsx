import { DtoRecord } from '../../api/interfaces/dto_record';
import { DtoCollectionWithRecord } from '../../api/interfaces/dto_collection';
import { DtoResUser, DtoResTeam } from '../../api/interfaces/dto_res';
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

    activeModule: string;

    leftPanelWidth: number;

    collapsed: boolean;
}

export interface UserInfoState {

    userInfo: DtoResUser;

    isLoaded: boolean;
}

export interface TeamState {

    teams: _.Dictionary<DtoResTeam>;
}

export interface State {

    uiState: UIState;

    userState: UserInfoState;

    teamState: TeamState;

    collectionState: CollectionState;

    displayRecordsState: DisplayRecordsState;

    // documentState: DocumentState;

    // mockState: MockState;

    // stressTestState: StressTestState;
}

export const initialState: State = {
    uiState: {
        activeModule: 'collection',
        leftPanelWidth: 300,
        collapsed: false
    },
    userState: {
        isLoaded: false,
        userInfo: {
            teams: [],
            id: '',
            name: '',
            password: '',
            email: '',
            isActive: false,
            createDate: new Date(),
            updateDate: new Date(),
        }
    },
    teamState: { teams: {} },
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