import { takeEvery, call, put, all } from 'redux-saga/effects';
import RequestManager from '../utils/request_manager';
import { HttpMethod } from '../common/http_method';
import { syncAction, actionCreator, SessionInvalidType } from './index';
import { Urls } from '../utils/urls';
import * as _ from 'lodash';
import { RunResult } from '../../../api/src/interfaces/dto_run_result';

export const AddTabType = 'add tab';

export const RemoveTabType = 'remove tab';

export const UpdateDisplayRecordType = 'update display record';

export const UpdateDisplayRecordPropertyType = 'update display record property';

export const ActiveTabType = 'active tab';

export const SendRequestType = 'send request';

export const SendRequestFulfilledType = 'send request fulfill';

export const SendRequestForParamType = 'send request for param';

export const SendRequestForParamFulfilledType = 'send request for param fulfill';

export const CancelRequestType = 'cancel request';

export const SaveRecordType = 'save record';

export const SaveAsRecordType = 'save as record';

export const ActiveRecordType = 'active record';

export const DeleteRecordType = 'delete record';

export const MoveRecordType = 'move record';

export const SaveAllType = 'save all';

export const CloseAllType = 'close all type';

export const CloseOthersType = 'close others';

export const CloseUnmodifiedType = 'close unmodified';

export const ChangeCurrentParamType = 'change current parameter';

export function* sendRequest() {
    yield takeEvery(SendRequestType, function* (action: any) {
        const value = action.value;
        const isParamReq = !value.record.id;
        let record = value.record;
        if (!action.value.record.id) {
            record = _.values<any>(value.record)[0];
        }
        RequestManager.removeCanceledRequest(record.id);
        let runResult: Partial<RunResult> = {};
        if (isParamReq) {
            yield all(Object.keys(value.record).map(k => put(actionCreator(SendRequestForParamType, { param: k, content: { environment: action.value.environment, record: { ...value.record[k], history: [] } } }))));
        } else {
            try {
                const res = yield call(RequestManager.post, Urls.getUrl(`record/run`), { ...value, record: { ...value.record, history: [] } });
                if (res.status === 403) {
                    yield put(actionCreator(SessionInvalidType));
                }
                if (RequestManager.checkCanceledThenRemove(record.id)) {
                    return;
                }
                runResult = yield res.json();
                if (runResult.consoleMsgQueue) {
                    runResult.consoleMsgQueue.forEach(m => console[m.type] && console[m.type](m.message));
                }
            } catch (err) {
                runResult.error = { message: err.message, stack: err.stack };
            }
        }
        yield put(actionCreator(SendRequestFulfilledType, { id: record.id, cid: record.collectionId, isParamReq, runResult }));
    });
}

export function* sendRequestForParam() {
    yield takeEvery(SendRequestForParamType, function* (action: any) {
        const value = action.value;
        let runResult: Partial<RunResult> = {};
        try {
            RequestManager.removeCanceledRequest(value.content.record.id);
            const res = yield call(RequestManager.post, Urls.getUrl(`record/run`), { ...value.content, record: { ...value.content.record, history: [] } });
            if (res.status === 403) {
                yield put(actionCreator(SessionInvalidType));
            }
            if (RequestManager.checkCanceledThenRemove(value.content.record.id)) {
                return;
            }
            runResult = yield res.json();
            if (runResult.consoleMsgQueue) {
                runResult.consoleMsgQueue.forEach(m => console[m.type] && console[m.type](m.message));
            }
        } catch (err) {
            runResult.error = { message: err.message, stack: err.stack };
        }
        yield put(actionCreator(SendRequestForParamFulfilledType, { param: value.param, runResult }));
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
    const channelAction = syncAction({ type: SaveRecordType, method: method, url: Urls.getUrl(`record`), body: { ...action.value.record, history: [] } });
    yield put(channelAction);
}

export function* deleteRecord() {
    yield takeEvery(DeleteRecordType, function* (action: any) {
        const channelAction = syncAction({ type: DeleteRecordType, method: HttpMethod.DELETE, url: Urls.getUrl(`record/${action.value.id}`) });
        yield put(channelAction);
    });
}

export function* moveRecord() {
    yield takeEvery(MoveRecordType, function* (action: any) {
        const channelAction = syncAction({ type: MoveRecordType, method: HttpMethod.PUT, url: Urls.getUrl(`record`), body: { ...action.value.record, history: [] } });
        yield put(channelAction);
    });
}