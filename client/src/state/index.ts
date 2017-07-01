import { UIState } from './ui';
import { ProjectState } from './project';
import { UserInfoState } from './user';
import { EnvironmentState } from './environment';
import { CollectionState, DisplayRecordsState } from './collection';
import { LocalDataState } from './local_data';
import { RequestStatus } from '../common/request_status';
import { ScheduleState } from './schedule';

export interface RequestState {

    status: RequestStatus;

    message?: string;
}

export const requestStateDefaultValue = { status: RequestStatus.none, message: '' };

export interface State {

    localDataState: LocalDataState;

    uiState: UIState;

    userState: UserInfoState;

    projectState: ProjectState;

    collectionState: CollectionState;

    displayRecordsState: DisplayRecordsState;

    environmentState: EnvironmentState;

    scheduleState: ScheduleState;

    // documentState: DocumentState;

    // mockState: MockState;

    // stressTestState: StressTestState;
}