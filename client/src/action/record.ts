import { takeEvery, call, put } from 'redux-saga/effects';
import RequestManager from '../utils/request_manager';
import { HttpMethod } from '../common/http_method';
import { syncAction, actionCreator } from './index';

export const AddTabType = 'add tab';

export const RemoveTabType = 'remove tab';

export const UpdateTabChangedType = 'update changed tab';

export const ActiveTabType = 'active tab';

export const UpdateTabRecordId = 'update tab record id';

export const SendRequestType = 'send request';

export const SendRequestFulfilledType = 'send request fulfill';

export const CancelRequestType = 'cancel request';

export const SaveRecordType = 'save record';

export const SaveAsRecordType = 'save as record';

export const ActiveRecordType = 'active record';

export const DeleteRecordType = 'delete record';

export const MoveRecordType = 'move record';

export const ChangeBodyType = 'change body type';

export const AppendTestType = 'append test';

export function* sendRequest() {
    yield takeEvery(SendRequestType, function* (action: any) {
        let runResult: any = {};
        try {
            const res = yield call(RequestManager.post, 'http://localhost:3000/api/record/run', action.value);
            if (RequestManager.checkCanceledThenRemove(action.value.record.id)) {
                return;
            }
            runResult = yield res.json();
        } catch (err) {
            runResult.error = { message: err.message, stack: err.stack };
        }
        yield put(actionCreator(SendRequestFulfilledType, { id: action.value.record.id, runResult }));
    });
}

export function* saveRecord() {
    yield takeEvery(SaveRecordType, pushSaveRecordToChannel);
}

export function* saveAsRecord() {
    yield takeEvery(SaveAsRecordType, pushSaveRecordToChannel);
}

function* pushSaveRecordToChannel(action: any) {
    const method = action.value.isNew ? HttpMethod.POST : HttpMethod.PUT;
    const channelAction = syncAction({ type: SaveRecordType, method: method, url: 'http://localhost:3000/api/record', body: action.value.record });
    yield put(channelAction);
}

export function* deleteRecord() {
    yield takeEvery(DeleteRecordType, function* (action: any) {
        const channelAction = syncAction({ type: DeleteRecordType, method: HttpMethod.DELETE, url: `http://localhost:3000/api/record/${action.value.id}` });
        yield put(channelAction);
    });
}

export function* moveRecord() {
    yield takeEvery(MoveRecordType, function* (action: any) {
        const channelAction = syncAction({ type: MoveRecordType, method: HttpMethod.PUT, url: 'http://localhost:3000/api/record', body: action.value.record });
        yield put(channelAction);
    });
}