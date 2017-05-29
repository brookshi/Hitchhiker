import { take, actionChannel, call, spawn, put, takeEvery } from 'redux-saga/effects';
import { refreshCollection } from './collection';
import { sendRequest, saveRecord, saveAsRecord } from './record';
import RequestManager, { SyncItem } from '../utils/request_manager';
import { delay } from 'redux-saga';
import { login } from './login';
import { saveTeam, quitTeam, disbandTeam, removeUser, inviteMember, saveEnvironment, delEnvironment } from './team';
import { channelActions } from './collection';
import * as _ from 'lodash';

export const ResizeLeftPanelType = 'resize_left_panel_type';
export const UpdateLeftPanelType = 'collapse_left_panel_type';

export const SyncActionType = 'sync_type';
export const SyncFailedActionType = 'sync_failed_type';

export function actionCreator<T>(type: string, value?: T) { return { type, value }; };

export function syncAction(syncItem: SyncItem) { return { type: SyncActionType, syncItem }; }
export function syncFailedAction(syncItem: SyncItem) { return { type: SyncFailedActionType, syncItem }; }

const RetryTimes = 3;

export function* rootSaga() {

    yield [
        spawn(login),
        spawn(refreshCollection),
        spawn(sendRequest),
        spawn(saveRecord),
        spawn(saveAsRecord),
        // spawn(deleteRecord),
        // spawn(moveRecord),
        // spawn(saveCollection),
        // spawn(deleteCollection),
        spawn(saveTeam),
        spawn(quitTeam),
        spawn(disbandTeam),
        spawn(removeUser),
        spawn(inviteMember),
        spawn(saveEnvironment),
        spawn(delEnvironment),
        ..._.keys(channelActions).map(c => spawn(function* () { yield takeAction(c, channelActions[c].getSyncItem); })),
        spawn(sync)
    ];
};

export function* takeAction(type: string, func: any) {
    yield takeEvery(type, function* (action: any) { yield pushToChannel(func(action)); });
}

function* pushToChannel(syncItem: any) {
    const channelAction = syncAction(syncItem);
    yield put(channelAction);
}

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