import { call, put, takeLatest } from 'redux-saga/effects';
import { errorAction } from '../common/action';
import RequestManager, { SyncItem } from '../utils/request_manager';
import { DtoCollection } from '../../../api/interfaces/dto_collection';
import { HttpMethod } from '../common/http_method';

export const RefreshCollectionType = 'refresh collection';

export const FetchCollectionSuccessType = 'fetch_collection_success_type';

export const FetchCollectionFailedType = 'fetch_collection_failed_type';

export const ActiveRecordType = 'active_record_type';

export const DeleteRecordType = 'delete_record_type';

export const DeleteCollectionType = 'delete_collection_type';

export const SaveCollectionType = 'save_collection_type';

export const MoveRecordType = 'move record';

export const fetchCollectionAction = (collections: DtoCollection[]) => ({ type: FetchCollectionSuccessType, collections });

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

export const channelActions: { [Key: string]: { getSyncItem: (action: any) => SyncItem } } = ({
    [DeleteRecordType]: {
        getSyncItem: (action) => ({
            type: DeleteRecordType,
            url: `http://localhost:3000/api/record/${action.value.id}`,
            method: HttpMethod.DELETE
        })
    },
    [DeleteCollectionType]: {
        getSyncItem: (action) => ({
            type: DeleteCollectionType,
            url: `http://localhost:3000/api/collection/${action.value}`,
            method: HttpMethod.DELETE
        })
    },
    [SaveCollectionType]: {
        getSyncItem: (action) => ({
            type: SaveCollectionType,
            url: `http://localhost:3000/api/collection`,
            method: action.value.isNew ? HttpMethod.POST : HttpMethod.PUT,
            body: action.value.collection
        })
    },
    [MoveRecordType]: {
        getSyncItem: (action) => ({
            type: MoveRecordType,
            url: 'http://localhost:3000/api/record',
            method: HttpMethod.PUT,
            body: action.value.record
        })
    }
});

// export function* deleteRecord() {
//     yield takeEvery(DeleteRecordType, pushDeleteRecordToChannel);
// }

// export function* deleteCollection() {
//     yield takeEvery(DeleteCollectionType, pushDeleteCollectionToChannel);
// }

// export function* saveCollection() {
//     yield takeEvery(SaveCollectionType, pushSaveCollectionToChannel);
// }

// export function* moveRecord() {
//     yield takeEvery(MoveRecordType, pushMoveRecordToChannel);
// }

// function* pushDeleteRecordToChannel(action: any) {
//     const channelAction = syncAction({ type: SyncType.delRecord, method: HttpMethod.DELETE, url: `http://localhost:3000/api/record/${action.value.id}` });
//     yield put(channelAction);
// }

// function* pushDeleteCollectionToChannel(action: any) {
//     const channelAction = syncAction({ type: SyncType.delCollection, method: HttpMethod.DELETE, url: `http://localhost:3000/api/collection/${action.value}` });
//     yield put(channelAction);
// }

// function* pushSaveCollectionToChannel(action: any) {
//     const channelAction = syncAction({ type: SyncType.addRecord, method: action.value.isNew ? HttpMethod.POST : HttpMethod.PUT, url: `http://localhost:3000/api/collection`, body: action.value.collection });
//     yield put(channelAction);
// }

// function* pushMoveRecordToChannel(action: any) {
//     const channelAction = syncAction({ type: SyncType.addRecord, method: HttpMethod.PUT, url: 'http://localhost:3000/api/record', body: action.value.record });
//     yield put(channelAction);
// }
