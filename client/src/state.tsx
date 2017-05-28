import { DtoRecord } from '../../api/interfaces/dto_record';
import { DtoCollectionWithRecord } from '../../api/interfaces/dto_collection';
import { DtoResUser, DtoResTeam } from '../../api/interfaces/dto_res';
import { StringUtil } from './utils/string_util';
import { RecordCategory } from './common/record_category';
import { RunResult } from '../../api/interfaces/dto_run_result';
import { DtoEnvironment } from '../../api/interfaces/dto_environment';
import { UIState, uiDefaultValue } from './state/ui_state';

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

    recordStates: RecordState[];

    responseState: ResponseState;
}

export interface ResponseState {

    [id: string]: RunResult;
}

export interface CollectionState {

    collectionsInfo: DtoCollectionWithRecord;

    isLoaded: boolean;
}

export interface EnvironmentState {

    environments: _.Dictionary<DtoEnvironment[]>;

    activeEnv: _.Dictionary<string>;

    isEditEnvDlgOpen: boolean;

    editedEnvironment?: string;
}

export interface UserInfoState {

    userInfo: DtoResUser;

    isLoaded: boolean;
}

export interface TeamState {

    teams: _.Dictionary<DtoResTeam>;

    activeTeam: string;
}

export interface State {

    uiState: UIState;

    userState: UserInfoState;

    teamState: TeamState;

    collectionState: CollectionState;

    displayRecordsState: DisplayRecordsState;

    environmentState: EnvironmentState;

    // documentState: DocumentState;

    // mockState: MockState;

    // stressTestState: StressTestState;
}

export const initialState: State = {
    uiState: uiDefaultValue,
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
    environmentState: {
        environments: {},
        activeEnv: {},
        isEditEnvDlgOpen: false
    },
    teamState: {
        teams: {},
        activeTeam: ''
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
        recordStates: [
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