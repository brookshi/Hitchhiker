import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import RequestManager from '../utils/request_manager';
import { HttpMethod } from '../common/http_method';
import { syncAction, actionCreator } from './index';

export const RefreshCollectionType = 'refresh collection';

export const FetchCollectionSuccessType = 'fetch collection success';

export const FetchCollectionFailedType = 'fetch collection failed';

export const DeleteCollectionType = 'delete collection';

export const SaveCollectionType = 'save collection';

export function* refreshCollection() {
    yield takeLatest(RefreshCollectionType, function* () {
        try {
            const res = yield call(RequestManager.get, 'http://localhost:3000/api/collections');
            const body = yield res.json();
            yield put(actionCreator(FetchCollectionSuccessType, body));
        } catch (err) {
            yield put(actionCreator(FetchCollectionFailedType, err));
        }
    });
}

export function* deleteCollection() {
    yield takeEvery(DeleteCollectionType, function* (action: any) {
        const channelAction = syncAction({ type: DeleteCollectionType, method: HttpMethod.DELETE, url: `http://localhost:3000/api/collection/${action.value}` });
        yield put(channelAction);
    });
}

export function* saveCollection() {
    yield takeEvery(SaveCollectionType, function* (action: any) {
        const channelAction = syncAction({ type: SaveCollectionType, method: action.value.isNew ? HttpMethod.POST : HttpMethod.PUT, url: `http://localhost:3000/api/collection`, body: action.value.collection });
        yield put(channelAction);
    });
}
