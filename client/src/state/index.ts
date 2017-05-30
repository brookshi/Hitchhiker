import { UIState } from './ui';
import { TeamState } from './team';
import { UserInfoState } from './user';
import { EnvironmentState } from './environment';
import { CollectionState, DisplayRecordsState } from './collection';

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