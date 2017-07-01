import { takeEvery, put } from 'redux-saga/effects';
import { syncAction } from './index';
import { HttpMethod } from '../common/http_method';

export const QuitProjectType = 'quit project';

export const DisbandProjectType = 'disband project';

export const SaveProjectType = 'save project';

export const ActiveProjectType = 'active project';

export const InviteMemberType = 'invite members';

export const RemoveUserType = 'remove user';

export const SaveEnvironmentType = 'save environment';

export const DelEnvironmentType = 'delete environment';

export const EditEnvCompletedType = 'edit environment completed';

export const SwitchEnvType = 'switch environment';

export const EditEnvType = 'edit environment';

export function* quitProject() {
    yield takeEvery(QuitProjectType, function* (action: any) {
        const channelAction = syncAction({ type: QuitProjectType, method: HttpMethod.DELETE, url: `http://localhost:3000/api/project/${action.value.id}/own` });
        yield put(channelAction);
    });
}

export function* disbandProject() {
    yield takeEvery(DisbandProjectType, function* (action: any) {
        const channelAction = syncAction({ type: DisbandProjectType, method: HttpMethod.DELETE, url: `http://localhost:3000/api/project/${action.value.id}` });
        yield put(channelAction);
    });
}

export function* saveProject() {
    yield takeEvery(SaveProjectType, function* (action: any) {
        const method = action.value.isNew ? HttpMethod.POST : HttpMethod.PUT;
        const channelAction = syncAction({ type: SaveProjectType, method, url: `http://localhost:3000/api/project`, body: action.value.project });
        yield put(channelAction);
    });
}

export function* inviteMember() {
    yield takeEvery(InviteMemberType, function* (action: any) {
        const channelAction = syncAction({ type: InviteMemberType, method: HttpMethod.POST, url: `http://localhost:3000/api/project/${action.value.projectId}`, body: { emails: action.value.emails } });
        yield put(channelAction);
    });
}

export function* removeUser() {
    yield takeEvery(RemoveUserType, function* (action: any) {
        const channelAction = syncAction({ type: RemoveUserType, method: HttpMethod.DELETE, url: `http://localhost:3000/api/project/${action.value.projectId}/user/${action.value.userId}` });
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