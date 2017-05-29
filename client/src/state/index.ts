import { UIState } from './ui_state';
import { TeamState } from './team_state';
import { UserInfoState } from './user_state';
import { EnvironmentState } from './environment_state';
import { CollectionState, DisplayRecordsState } from './collection_state';

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