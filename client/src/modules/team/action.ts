import { takeEvery, put } from 'redux-saga/effects';
import { syncAction } from '../../action';
import { SyncType } from '../../utils/request_manager';
import { HttpMethod } from '../../common/http_method';

export const QuitTeamType = 'quit_team_type';
export const DisbandTeamType = 'disband_team_type';
export const SaveTeamType = 'save_team_type';

export function* quitTeam() {
    yield takeEvery(QuitTeamType, pushQuitTeamToChannel);
}

function* pushQuitTeamToChannel(action: any) {
    const channelAction = syncAction({ type: SyncType.delRecord, method: HttpMethod.DELETE, url: `http://localhost:3000/api/record/${action.value.id}` });
    yield put(channelAction);
}