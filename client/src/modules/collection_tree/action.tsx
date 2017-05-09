import { DtoResCollection, DtoResRecord } from '../../../../api/interfaces/dto_res';
import { takeLatest } from 'redux-saga/effects';
import HttpClient from '../../utils/http_client';
import { call, put } from 'redux-saga/effects';
import { errorAction } from '../../common/action';
import { DtoRecord } from '../../../../api/interfaces/dto_record';

export const ActiveRecordType = 'active_record_type';
export const RefreshCollectionType = 'refresh_collection';
export const FetchCollectionType = 'fetch_collection';
export const FetchCollectionFailedType = 'fetch_collection_failed';

export const activeRecordAction = (record: DtoRecord | DtoResRecord) => ({ type: ActiveRecordType, record });

export const fetchCollectionAction = (collections: DtoResCollection[]) => ({ type: FetchCollectionType, collections });

export const refreshCollectionAction = () => ({ type: RefreshCollectionType });

export function* refreshCollection() {
    yield takeLatest(RefreshCollectionType, fetchCollection);
}

function* fetchCollection() {
    try {
        const res = yield call(HttpClient.get, 'http://localhost:3000/api/collections');
        const body = yield res.json();
        yield put(fetchCollectionAction(body));
    } catch (err) {
        yield put(errorAction(FetchCollectionFailedType, err));
    }
}