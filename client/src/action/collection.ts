import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import RequestManager from '../utils/request_manager';
import { HttpMethod } from '../common/http_method';
import { syncAction, actionCreator, SessionInvalidType } from './index';

export const RefreshCollectionType = 'refresh collection';

export const FetchCollectionPendingType = 'fetch collection pending';

export const FetchCollectionSuccessType = 'fetch collection success';

export const FetchCollectionFailedType = 'fetch collection failed';

export const DeleteCollectionType = 'delete collection';

export const SaveCollectionType = 'save collection';

export const ShareCollectionType = 'share collection';

export const SelectedTeamChangedType = 'select team';

export const CollectionOpenKeysType = 'open/close collection';

export function* refreshCollection() {
    yield takeLatest(RefreshCollectionType, function* () {
        try {
            yield put(actionCreator(FetchCollectionPendingType));
            const res = yield call(RequestManager.get, 'http://localhost:3000/api/collections');
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
        const channelAction = syncAction({ type: DeleteCollectionType, method: HttpMethod.DELETE, url: `http://localhost:3000/api/collection/${action.value}` });
        yield put(channelAction);
    });
}

export function* shareCollection() { // TODO: improve: share collection with environments.
    yield takeEvery(ShareCollectionType, function* (action: any) {
        const { collectionId, teamId } = action.value;
        const channelAction = syncAction({ type: ShareCollectionType, method: HttpMethod.GET, url: `http://localhost:3000/api/collection/share/${collectionId}/to/${teamId}` });
        yield put(channelAction);
    });
}

export function* saveCollection() {
    yield takeEvery(SaveCollectionType, function* (action: any) {
        const channelAction = syncAction({ type: SaveCollectionType, method: action.value.isNew ? HttpMethod.POST : HttpMethod.PUT, url: `http://localhost:3000/api/collection`, body: action.value.collection });
        yield put(channelAction);
    });
}
