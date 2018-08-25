import { takeEvery, put } from 'redux-saga/effects';
import { syncAction } from './index';
import { HttpMethod } from '../misc/http_method';
import { Urls } from '../utils/urls';

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

export const SaveLocalhostMappingType = 'save localhost mapping';

export const SaveGlobalFunctionType = 'save global function';

export const AddProjectFileType = 'add project file';

export const DeleteProjectFileType = 'delete project file';

export function* quitProject() {
    yield takeEvery(QuitProjectType, function* (action: any) {
        const channelAction = syncAction({ type: QuitProjectType, method: HttpMethod.DELETE, url: Urls.getUrl(`project/${action.value.id}/own`) });
        yield put(channelAction);
    });
}

export function* disbandProject() {
    yield takeEvery(DisbandProjectType, function* (action: any) {
        const channelAction = syncAction({ type: DisbandProjectType, method: HttpMethod.DELETE, url: Urls.getUrl(`project/${action.value.id}`) });
        yield put(channelAction);
    });
}

export function* saveProject() {
    yield takeEvery(SaveProjectType, function* (action: any) {
        const method = action.value.isNew ? HttpMethod.POST : HttpMethod.PUT;
        const channelAction = syncAction({ type: SaveProjectType, method, url: Urls.getUrl(`project`), body: action.value.project });
        yield put(channelAction);
    });
}

export function* inviteMember() {
    yield takeEvery(InviteMemberType, function* (action: any) {
        const channelAction = syncAction({ type: InviteMemberType, method: HttpMethod.POST, url: Urls.getUrl(`project/${action.value.projectId}`), body: { emails: action.value.emails } });
        yield put(channelAction);
    });
}

export function* removeUser() {
    yield takeEvery(RemoveUserType, function* (action: any) {
        const channelAction = syncAction({ type: RemoveUserType, method: HttpMethod.DELETE, url: Urls.getUrl(`project/${action.value.projectId}/user/${action.value.userId}`) });
        yield put(channelAction);
    });
}

export function* saveEnvironment() {
    yield takeEvery(SaveEnvironmentType, function* (action: any) {
        const method = action.value.isNew ? HttpMethod.POST : HttpMethod.PUT;
        const channelAction = syncAction({ type: SaveEnvironmentType, method: method, url: Urls.getUrl(`environment`), body: action.value.env });
        yield put(channelAction);
    });
}

export function* delEnvironment() {
    yield takeEvery(DelEnvironmentType, function* (action: any) {
        const channelAction = syncAction({ type: DelEnvironmentType, method: HttpMethod.DELETE, url: Urls.getUrl(`environment/${action.value.envId}`) });
        yield put(channelAction);
    });
}

export function* saveLocalhostMapping() {
    yield takeEvery(SaveLocalhostMappingType, function* (action: any) {
        const { isNew, id, projectId, ip } = action.value;
        const channelAction = syncAction({ type: SaveLocalhostMappingType, method: isNew ? HttpMethod.POST : HttpMethod.PUT, url: Urls.getUrl(`project/${projectId}/localhost/${id}/ip/${ip}`) });
        yield put(channelAction);
    });
}

export function* saveGlobalFunction() {
    yield takeEvery(SaveGlobalFunctionType, function* (action: any) {
        const { projectId, globalFunc } = action.value;
        const channelAction = syncAction({ type: SaveGlobalFunctionType, method: HttpMethod.PUT, url: Urls.getUrl(`project/${projectId}/globalfunc`), body: { content: globalFunc } });
        yield put(channelAction);
    });
}

export function* delProjectFile() {
    yield takeEvery(DeleteProjectFileType, function* (action: any) {
        const { pid, type, name } = action.value;
        const channelAction = syncAction({ type: DeleteProjectFileType, method: HttpMethod.DELETE, url: Urls.getUrl(`project/${pid}/file/${type}/${name}`) });
        yield put(channelAction);
    });
}