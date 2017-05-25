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

export function* disbandTeam() {
    yield takeEvery(DisbandTeamType, pushDisbandTeamToChannel);
}

export function* saveTeam() {
    yield takeEvery(SaveTeamType, pushSaveTeamToChannel);
}

function* pushQuitTeamToChannel(action: any) {
    const channelAction = syncAction({ type: SyncType.quitTeam, method: HttpMethod.DELETE, url: `http://localhost:3000/api/team/${action.value.id}/own` });
    yield put(channelAction);
}

function* pushDisbandTeamToChannel(action: any) {
    const channelAction = syncAction({ type: SyncType.disbandTeam, method: HttpMethod.DELETE, url: `http://localhost:3000/api/team/${action.value.id}` });
    yield put(channelAction);
}

function* pushSaveTeamToChannel(action: any) {
    const method = action.value.isNew ? HttpMethod.POST : HttpMethod.PUT;
    const channelAction = syncAction({ type: SyncType.saveTeam, method, url: `http://localhost:3000/api/team`, body: action.value.team });
    yield put(channelAction);
}