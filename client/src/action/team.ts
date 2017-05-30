import { takeEvery, put } from 'redux-saga/effects';
import { syncAction } from './index';
import { HttpMethod } from '../common/http_method';

export const QuitTeamType = 'quit team';

export const DisbandTeamType = 'disband team';

export const SaveTeamType = 'save team';

export const ActiveTeamType = 'active team';

export const InviteMemberType = 'invite members';

export const RemoveUserType = 'remove user';

export const SaveEnvironmentType = 'save environment';

export const DelEnvironmentType = 'delete environment';

export const EditEnvCompletedType = 'edit environment completed';

export const SwitchEnvType = 'switch environment';

export const EditEnvType = 'edit environment';

export function* quitTeam() {
    yield takeEvery(QuitTeamType, function* (action: any) {
        const channelAction = syncAction({ type: QuitTeamType, method: HttpMethod.DELETE, url: `http://localhost:3000/api/team/${action.value.id}/own` });
        yield put(channelAction);
    });
}

export function* disbandTeam() {
    yield takeEvery(DisbandTeamType, function* (action: any) {
        const channelAction = syncAction({ type: DisbandTeamType, method: HttpMethod.DELETE, url: `http://localhost:3000/api/team/${action.value.id}` });
        yield put(channelAction);
    });
}

export function* saveTeam() {
    yield takeEvery(SaveTeamType, function* (action: any) {
        const method = action.value.isNew ? HttpMethod.POST : HttpMethod.PUT;
        const channelAction = syncAction({ type: SaveTeamType, method, url: `http://localhost:3000/api/team`, body: action.value.team });
        yield put(channelAction);
    });
}

export function* inviteMember() {
    yield takeEvery(InviteMemberType, function* (action: any) {
        const channelAction = syncAction({ type: InviteMemberType, method: HttpMethod.POST, url: `http://localhost:3000/api/team/${action.value.teamId}`, body: { emails: action.value.emails } });
        yield put(channelAction);
    });
}

export function* removeUser() {
    yield takeEvery(RemoveUserType, function* (action: any) {
        const channelAction = syncAction({ type: RemoveUserType, method: HttpMethod.DELETE, url: `http://localhost:3000/api/team/${action.value.teamId}/user/${action.value.userId}` });
        yield put(channelAction);
    });
}

export function* saveEnvironment() {
    yield takeEvery(SaveEnvironmentType, function* (action: any) {
        const method = action.value.isNew ? HttpMethod.POST : HttpMethod.PUT;
        const channelAction = syncAction({ type: SaveEnvironmentType, method: method, url: `http://localhost:3000/api/environment`, body: action.value.env });
        yield put(channelAction);
    });
}

export function* delEnvironment() {
    yield takeEvery(DelEnvironmentType, function* (action: any) {
        const channelAction = syncAction({ type: DelEnvironmentType, method: HttpMethod.DELETE, url: `http://localhost:3000/api/environment/${action.value.envId}` });
        yield put(channelAction);
    });
}