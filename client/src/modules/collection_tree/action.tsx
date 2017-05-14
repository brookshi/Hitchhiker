import { takeLatest } from 'redux-saga/effects';
import { call, put } from 'redux-saga/effects';
import { errorAction } from '../../common/action';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import RequestManager from '../../utils/request_manager';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';

export const ActiveRecordType = 'active_record_type';
export const RefreshCollectionType = 'refresh_collection';
export const FetchCollectionType = 'fetch_collection';
export const FetchCollectionFailedType = 'fetch_collection_failed';

export const activeRecordAction = (record: DtoRecord) => ({ type: ActiveRecordType, record });

export const fetchCollectionAction = (collections: DtoCollection[]) => ({ type: FetchCollectionType, collections });

export const refreshCollectionAction = () => ({ type: RefreshCollectionType });

export function* refreshCollection() {
    yield takeLatest(RefreshCollectionType, fetchCollection);
}

function* fetchCollection() {
    try {
        const res = yield call(RequestManager.get, 'http://localhost:3000/api/collections');
        const body = yield res.json();
        yield put(fetchCollectionAction(body));
    } catch (err) {
        yield put(errorAction(FetchCollectionFailedType, err));
    }
}