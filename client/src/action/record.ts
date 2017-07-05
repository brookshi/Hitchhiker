import { takeEvery, call, put } from 'redux-saga/effects';
import RequestManager from '../utils/request_manager';
import { HttpMethod } from '../common/http_method';
import { syncAction, actionCreator } from './index';
import { store } from "../store";
import { State } from "../state/index";
import { DtoRecord } from "../../../api/interfaces/dto_record";
import { getActiveEnvId } from "../modules/collection/req_res_panel/selector";
import { StringUtil } from "../utils/string_util";
import * as _ from "lodash";

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

export const SwitchBodyType = 'change body type';

export const AppendTestType = 'append test';

export const ChangeDisplayRecordType = 'change display record';

export function* sendRequest() {
    yield takeEvery(SendRequestType, function* (action: any) {
        const value = getSendRequestRecordAndEnv();
        let runResult: any = {};
        try {
            const res = yield call(RequestManager.post, 'http://localhost:3000/api/record/run', value);
            if (RequestManager.checkCanceledThenRemove(value.record.id)) {
                return;
            }
            runResult = yield res.json();
        } catch (err) {
            runResult.error = { message: err.message, stack: err.stack };
        }
        yield put(actionCreator(SendRequestFulfilledType, { id: value.record.id, runResult }));
    });
}

export function* saveRecord() {
    yield takeEvery(SaveRecordType, pushSaveRecordToChannel);
}

export function* saveAsRecord() {
    yield takeEvery(SaveAsRecordType, pushSaveRecordToChannel);
}

function* pushSaveRecordToChannel(action: any) {
    const record = getActiveRecord();
    const method = action.value.isNew ? HttpMethod.POST : HttpMethod.PUT;
    const channelAction = syncAction({ type: SaveRecordType, method: method, url: 'http://localhost:3000/api/record', body: record });
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

function getActiveRecord(): DtoRecord {
    const { recordStates, activeKey } = (store.getState() as State).displayRecordsState;
    const recordState = recordStates.find(r => r.record.id === activeKey);
    if (!recordState) {
        throw new Error('cannot find active record');
    }
    return recordState.record;
}

function getSendRequestRecordAndEnv() {
    const state = store.getState() as State;
    const record = getActiveRecord();
    const environment = getActiveEnvId(state);
    const cookies = state.localDataState.cookies;
    const headers = [...record.headers || []];
    const hostName = new URL(record.url || '').hostname;
    const localCookies = hostName ? cookies[hostName] || [] : [];
    const cookieHeader = headers.find(h => h.isActive && (h.key || '').toLowerCase() === 'cookie');

    let recordCookies: _.Dictionary<string> = {};
    if (cookieHeader) {
        recordCookies = StringUtil.readCookies(cookieHeader.value || '');
    }
    const allCookies = { ...localCookies, ...recordCookies };
    _.remove(headers, h => h.key === 'Cookie');

    return { record: { ...record, headers: [...headers, { key: 'Cookie', value: _.values(allCookies).join('; '), isActive: true }] }, environment };
}