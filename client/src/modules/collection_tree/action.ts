import { takeLatest } from 'redux-saga/effects';
import { call, put, takeEvery } from 'redux-saga/effects';
import { errorAction } from '../../common/action';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import RequestManager, { SyncType } from '../../utils/request_manager';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';
import { syncAction } from '../../action';
import { HttpMethod } from '../../common/http_method';

export const RefreshCollectionType = 'refresh_collection';
export const FetchCollectionType = 'fetch_collection';
export const ActiveRecordType = 'active_record_type';
export const FetchCollectionFailedType = 'fetch_collection_failed';
export const DeleteRecordType = 'delete_record_type';
export const DeleteCollectionType = 'delete_collection_type';
export const UpdateCollectionType = 'update_collection_type';
export const CreateCollectionType = 'create_collection_type';
export const SaveCollectionType = 'save_collection_type';
export const MoveRecordType = 'move_record_type';

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

export function* deleteRecord() {
    yield takeEvery(DeleteRecordType, pushDeleteRecordToChannel);
}

export function* deleteCollection() {
    yield takeEvery(DeleteCollectionType, pushDeleteCollectionToChannel);
}

export function* saveCollection() {
    yield takeEvery(SaveCollectionType, pushSaveCollectionToChannel);
}

export function* moveRecord() {
    yield takeEvery(MoveRecordType, pushMoveRecordToChannel);
}

function* pushDeleteRecordToChannel(action: any) {
    const channelAction = syncAction({ type: SyncType.delRecord, method: HttpMethod.DELETE, url: `http://localhost:3000/api/record/${action.value.id}` });
    yield put(channelAction);
}

function* pushDeleteCollectionToChannel(action: any) {
    const channelAction = syncAction({ type: SyncType.delCollection, method: HttpMethod.DELETE, url: `http://localhost:3000/api/collection/${action.value}` });
    yield put(channelAction);
}

function* pushSaveCollectionToChannel(action: any) {
    const channelAction = syncAction({ type: SyncType.addRecord, method: action.value.isNew ? HttpMethod.POST : HttpMethod.PUT, url: `http://localhost:3000/api/collection`, body: action.value.collection });
    yield put(channelAction);
}

function* pushMoveRecordToChannel(action: any) {
    const channelAction = syncAction({ type: SyncType.addRecord, method: HttpMethod.PUT, url: 'http://localhost:3000/api/record', body: action.value.record });
    yield put(channelAction);
}
