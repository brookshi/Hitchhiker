import { put, takeEvery } from 'redux-saga/effects';
import { HttpMethod } from '../misc/http_method';
import { syncAction, actionCreator, ReloadType } from './index';
import { Urls } from '../utils/urls';

export const DeleteCollectionType = 'delete collection';

export const SaveCollectionType = 'save collection';

export const ShareCollectionType = 'share collection';

export const SelectedProjectChangedType = 'select project';

export const CollectionOpenKeysType = 'open/close collection';

export const ImportDataType = 'import data';

export function* deleteCollection() {
    yield takeEvery(DeleteCollectionType, function* (action: any) {
        const channelAction = syncAction({ type: DeleteCollectionType, method: HttpMethod.DELETE, url: Urls.getUrl(`collection/${action.value}`) });
        yield put(channelAction);
    });
}

export function* shareCollection() { // TODO: improve: share collection with environments.
    yield takeEvery(ShareCollectionType, function* (action: any) {
        const { collectionId, projectId } = action.value;
        const channelAction = syncAction({ type: ShareCollectionType, method: HttpMethod.GET, url: Urls.getUrl(`collection/share/${collectionId}/to/${projectId}`) });
        yield put(channelAction);
    });
}

export function* saveCollection() {
    yield takeEvery(SaveCollectionType, function* (action: any) {
        const channelAction = syncAction({ type: SaveCollectionType, method: action.value.isNew ? HttpMethod.POST : HttpMethod.PUT, url: Urls.getUrl(`collection`), body: action.value.collection });
        yield put(channelAction);
    });
}

export function* importData() {
    yield takeEvery(ImportDataType, function* (action: any) {
        const channelAction = syncAction({ type: ImportDataType, method: HttpMethod.POST, url: Urls.getUrl(`collection/${action.value.projectId}`), body: action.value.data, successAction: () => actionCreator(ReloadType) });
        yield put(channelAction);
    });
}
