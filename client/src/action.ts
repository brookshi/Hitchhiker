import { take, actionChannel, call, spawn, put } from 'redux-saga/effects';
import { refreshCollection, deleteRecord, saveCollection, deleteCollection, moveRecord } from './modules/collection_tree/action';
import { sendRequest, saveRecord, saveAsRecord } from './modules/req_res_panel/action';
import RequestManager, { SyncItem } from './utils/request_manager';
import { delay } from 'redux-saga';

export const SyncActionType = 'sync_type';
export const SyncFailedActionType = 'sync_failed_type';

export function actionCreator<T>(type: string, value?: T) { return { type, value }; };

export function syncAction(syncItem: SyncItem) { return { type: SyncActionType, syncItem }; }
export function syncFailedAction(syncItem: SyncItem) { return { type: SyncFailedActionType, syncItem }; }

const RetryTimes = 3;

export function* rootSaga() {
    yield [
        spawn(refreshCollection),
        spawn(sendRequest),
        spawn(saveRecord),
        spawn(saveAsRecord),
        spawn(deleteRecord),
        spawn(moveRecord),
        spawn(saveCollection),
        spawn(deleteCollection),
        spawn(sync)
    ];
};

function* sync() {
    const channel = yield actionChannel(SyncActionType);

    while (true) {
        const { syncItem } = yield take(channel);
        yield call(handleRequest, syncItem);
    }
}

function* handleRequest(syncItem: SyncItem) {
    for (let i = 1; i <= RetryTimes; i++) {
        try {
            yield call(RequestManager.sync, syncItem);
            return;
        } catch (e) {
            console.warn(`retry: ${i}, type: ${syncItem.type} ${syncItem.url}`);
            if (i !== RetryTimes) {
                yield call(delay, 1000);
            } else {
                yield put(syncFailedAction(syncItem));
            }
        }
    }
}