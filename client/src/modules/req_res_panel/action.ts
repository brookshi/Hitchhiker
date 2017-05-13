import { DtoRecordRun } from '../../../../api/interfaces/dto_record_run';
import { RunResult } from '../../../../api/interfaces/dto_run_result';
import { takeEvery, call, put } from 'redux-saga/effects';
import RequestManager from '../../utils/request_manager';

export const AddRecordType = 'add_record_type';
export const RemoveRecordType = 'remove_record_type';
export const UpdateRecordType = 'update_record_type';
export const ActiveTabType = 'active_tab_type';
export const SendRequestType = 'send_request_type';
export const SendRequestFulfilledType = 'send_request_fulfilled_type';
export const SendRequestFailedType = 'send_request_failed_type';
export const CancelRequestType = 'cancel_request_type';

export const addTabAction = () => ({ type: AddRecordType });

export const removeTabAction = (key) => ({ type: RemoveRecordType, key });

export const updateRecordAction = (record) => ({ type: UpdateRecordType, record });

export const sendRequestAction = (recordRun: DtoRecordRun) => ({ type: SendRequestType, recordRun });

export const cancelRequestAction = (id: string) => ({ type: CancelRequestType, id });

export const sendRequestFulfilledAction = (result: { id: string, runResult: RunResult }) => ({ type: SendRequestFulfilledType, result });

export const activeTabAction = (key: string) => ({ type: ActiveTabType, key });

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