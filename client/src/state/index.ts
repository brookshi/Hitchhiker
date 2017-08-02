import { UIState, uiDefaultValue } from './ui';
import { ProjectState, projectDefaultValue } from './project';
import { UserInfoState, userInfoDefaultValue } from './user';
import { EnvironmentState, environmentDefaultValue } from './environment';
import { CollectionState, DisplayRecordsState, collectionDefaultValue, displayRecordsDefaultValue } from './collection';
import { LocalDataState, localDataDefaultValue } from './local_data';
import { ScheduleState, scheduleDefaultValue } from './schedule';

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

export const defaultState: State = {

    localDataState: localDataDefaultValue,

    uiState: uiDefaultValue,

    userState: userInfoDefaultValue,

    projectState: projectDefaultValue,

    collectionState: collectionDefaultValue,

    displayRecordsState: displayRecordsDefaultValue,

    environmentState: environmentDefaultValue,

    scheduleState: scheduleDefaultValue
}