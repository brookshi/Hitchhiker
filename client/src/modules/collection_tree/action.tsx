import { DtoResCollection } from '../../../../api/interfaces/dto_res';
import { takeLatest } from 'redux-saga';
import HttpClient from '../../utils/http_client';
import { call, put } from 'redux-saga/effects';
import { errorAction } from '../../common/action';

export const RefreshCollection = 'refresh_collection';
export const FetchCollection: string = 'fetch_collection';
export const FetchCollectionFailed: string = 'fetch_collection_failed';

export const fetchCollectionAction = (collections: DtoResCollection[]) => ({ type: FetchCollection, collections });

export const refreshCollectionAction = () => ({ type: RefreshCollection });

export function* refreshCollection() {
    yield* takeLatest(RefreshCollection, fetchCollection);
}

function* fetchCollection() {
    try {
        const res = yield call(HttpClient.get, 'http://localhost:3000/api/collections');
        const body = yield res.json();
        yield put(fetchCollectionAction(body));
    } catch (err) {
        yield put(errorAction(FetchCollectionFailed, err));
    }
}