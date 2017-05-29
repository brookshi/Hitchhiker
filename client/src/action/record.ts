import { DtoRecordRun } from '../../../api/interfaces/dto_record_run';
import { RunResult } from '../../../api/interfaces/dto_run_result';
import { takeEvery, call, put } from 'redux-saga/effects';
import RequestManager, { SyncType } from '../utils/request_manager';
import { DtoRecord } from '../../../api/interfaces/dto_record';
import { syncAction } from '../action';
import { HttpMethod } from '../common/http_method';

export const AddTabType = 'add_tab_type';
export const RemoveTabType = 'remove_tab_type';
export const UpdateTabChangedType = 'update_tab_changed_type';
export const ActiveTabType = 'active_tab_type';
export const SendRequestType = 'send_request_type';
export const SendRequestFulfilledType = 'send_request_fulfilled_type';
export const SendRequestFailedType = 'send_request_failed_type';
export const CancelRequestType = 'cancel_request_type';
export const SaveRecordType = 'save_record_type';
export const SaveAsRecordType = 'save_as_record_type';
export const UpdateTabRecordId = 'update_tab_record_id';
export const SwitchEnvType = 'switch_env_type';
export const EditEnvType = 'edit_env_type';

export const addTabAction = () => ({ type: AddTabType });

export const removeTabAction = (key) => ({ type: RemoveTabType, key });

export const updateRecordAction = (record) => ({ type: UpdateTabChangedType, record });

export const sendRequestAction = (recordRun: DtoRecordRun) => ({ type: SendRequestType, recordRun });

export const cancelRequestAction = (id: string) => ({ type: CancelRequestType, id });

export const sendRequestFulfilledAction = (result: { id: string, runResult: RunResult }) => ({ type: SendRequestFulfilledType, result });

export const activeTabAction = (key: string) => ({ type: ActiveTabType, key });

export const saveRecordAction = (record: DtoRecord) => ({ type: SaveRecordType, value: { isNew: record.id.startsWith('@new'), record } });

export const saveAsRecordAction = (record: DtoRecord) => ({ type: SaveAsRecordType, value: { isNew: true, record } });

export function* sendRequest() {
    yield takeEvery(SendRequestType, sendRequestFulfilled);
}

function* sendRequestFulfilled(action: any) {
    let runResult;
    try {
        const res = yield call(RequestManager.post, 'http://localhost:3000/api/record/run', action.recordRun);
        if (RequestManager.checkCanceledThenRemove(action.recordRun.record.id)) {
            return;
        }
        runResult = yield res.json();
    } catch (err) {
        runResult.error = err;
    }
    yield put(sendRequestFulfilledAction({ id: action.recordRun.record.id, runResult }));
}

export function* saveRecord() {
    yield takeEvery(SaveRecordType, function* (action) { yield pushSaveRecordToChannel(action); });
}

export function* saveAsRecord() {
    yield takeEvery(SaveAsRecordType, pushSaveRecordToChannel);
}

function* pushSaveRecordToChannel(action: any) {
    const method = action.value.isNew ? HttpMethod.POST : HttpMethod.PUT;
    const channelAction = syncAction({ type: SyncType.addRecord.toString(), method: method, url: 'http://localhost:3000/api/record', body: action.value.record });
    yield put(channelAction);
}