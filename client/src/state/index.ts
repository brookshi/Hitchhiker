import { UIState } from './ui';
import { TeamState } from './team';
import { UserInfoState } from './user';
import { EnvironmentState } from './environment';
import { CollectionState, DisplayRecordsState } from './collection';
import { LocalDataState } from './local_data';

export interface State {

    localDataState: LocalDataState;

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