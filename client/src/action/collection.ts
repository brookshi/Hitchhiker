import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import RequestManager from '../utils/request_manager';
import { HttpMethod } from '../common/http_method';
import { syncAction, actionCreator, SessionInvalidType, ReloadType } from './index';
import { Urls } from '../utils/urls';

export const RefreshCollectionType = 'refresh collection';

export const FetchCollectionPendingType = 'fetch collection pending';

export const FetchCollectionSuccessType = 'fetch collection success';

export const FetchCollectionFailedType = 'fetch collection failed';

export const DeleteCollectionType = 'delete collection';

export const SaveCollectionType = 'save collection';

export const ShareCollectionType = 'share collection';

export const SelectedProjectChangedType = 'select project';

export const CollectionOpenKeysType = 'open/close collection';

export const ImportPostmanDataType = 'import postman data';

export function* refreshCollection() {
    yield takeLatest(RefreshCollectionType, function* () {
        try {
            yield put(actionCreator(FetchCollectionPendingType));
            const res = yield call(RequestManager.get, Urls.getUrl('collections'));
            if (res.status === 403) {
                yield put(actionCreator(SessionInvalidType));
            } else {
                const body = yield res.json();
                if (!body.success) {
                    yield put(actionCreator(FetchCollectionFailedType, body.message));
                } else {
                    yield put(actionCreator(FetchCollectionSuccessType, body.result));
                }
            }
        } catch (err) {
            yield put(actionCreator(FetchCollectionFailedType, err.toString()));
        }
    });
}

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

export function* importPostman() {
    yield takeEvery(ImportPostmanDataType, function* (action: any) {
        const channelAction = syncAction({ type: ImportPostmanDataType, method: HttpMethod.POST, url: Urls.getUrl(`collection/postman/${action.value.projectId}`), body: action.value.data, successAction: () => actionCreator(ReloadType) });
        yield put(channelAction);
    });
}
