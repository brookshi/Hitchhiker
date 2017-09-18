import { take, actionChannel, call, spawn, put } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import RequestManager, { SyncItem } from '../utils/request_manager';
import { sendRequest, saveRecord, saveAsRecord, deleteRecord, moveRecord, sendRequestForParam } from './record';
import { saveProject, quitProject, disbandProject, removeUser, inviteMember, saveEnvironment, delEnvironment, saveLocalhostMapping, saveGlobalFunction } from './project';
import { deleteCollection, saveCollection, refreshCollection, importPostman } from './collection';
import { login, logout, register, findPassword, getUserInfo, changePassword, tempUse } from './user';
import { storeLocalData, fetchLocalData } from './local_data';
import { deleteSchedule, saveSchedule, runSchedule } from './schedule';

export const SyncType = 'sync';

export const SyncSuccessType = 'sync success';

export const SyncFailedType = 'sync failed';

export const SyncRetryType = 'sync retry';

export const ResetSyncMsgType = 'reset sync message';

export const SessionInvalidType = 'session invalid';

export const ReloadType = 'reload';

export function actionCreator<T>(type: string, value?: T) { return { type, value }; };

export const syncAction = (syncItem: SyncItem) => ({ type: SyncType, syncItem });

export function* rootSaga() {

    yield [
        spawn(login),
        spawn(tempUse),
        spawn(getUserInfo),
        spawn(register),
        spawn(logout),
        spawn(findPassword),
        spawn(changePassword),
        spawn(fetchLocalData),
        spawn(storeLocalData),
        spawn(refreshCollection),
        spawn(deleteCollection),
        spawn(saveCollection),
        spawn(importPostman),
        spawn(sendRequest),
        spawn(sendRequestForParam),
        spawn(saveRecord),
        spawn(saveAsRecord),
        spawn(deleteRecord),
        spawn(moveRecord),
        spawn(saveProject),
        spawn(quitProject),
        spawn(disbandProject),
        spawn(saveLocalhostMapping),
        spawn(saveGlobalFunction),
        spawn(removeUser),
        spawn(inviteMember),
        spawn(saveEnvironment),
        spawn(delEnvironment),
        spawn(saveSchedule),
        spawn(deleteSchedule),
        spawn(runSchedule),
        spawn(sync)
    ];
};

function* sync() {
    const channel = yield actionChannel(SyncType);

    while (true) {
        const { syncItem } = yield take(channel);
        yield call(handleRequest, syncItem);
    }
}

function* handleRequest(syncItem: SyncItem) {
    let delayTime = 1000;
    for (let i = 0; i <= Number.MAX_VALUE; i++) {
        try {
            const res = yield call(RequestManager.sync, syncItem);
            if (res.status === 403) {
                yield put(actionCreator(SessionInvalidType));
            } else if (res.status >= 400) {
                throw new Error(res.statusText);
            }

            const body = yield res.json();
            if (body && body.success === false) {
                yield put(actionCreator(SyncFailedType, body.message));
                return;
            }
            if (body && body.success && syncItem.successAction) {
                yield put(syncItem.successAction(body.result));
            }

            yield put(actionCreator(SyncSuccessType, syncItem));

            return;
        } catch (e) {
            delayTime *= 2;
            yield put(actionCreator(SyncRetryType, { errMsg: e.toString(), delay: delayTime, time: i + 1, syncItem }));
            yield call(delay, delayTime);
        }
    }
}