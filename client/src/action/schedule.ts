import { takeEvery, put, call, take } from 'redux-saga/effects';
import { syncAction, actionCreator } from './index';
import { HttpMethod } from '../common/http_method';
import { eventChannel, END } from 'redux-saga';

export const SaveScheduleType = 'save schedule';

export const DeleteScheduleType = 'delete schedule';

export const ActiveScheduleType = 'active schedule';

export const RunScheduleType = 'run schedule';

export const ScheduleChunkDataType = 'schedule chunk data';

export const RunScheduleFulfillType = 'run schedule completely';

export function* saveSchedule() {
    yield takeEvery(SaveScheduleType, function* (action: any) {
        const channelAction = syncAction({ type: SaveScheduleType, method: action.value.isNew ? HttpMethod.POST : HttpMethod.PUT, url: `http://localhost:3000/api/schedule`, body: action.value.schedule });
        yield put(channelAction);
    });
}

export function* deleteSchedule() {
    yield takeEvery(DeleteScheduleType, function* (action: any) {
        const channelAction = syncAction({ type: DeleteScheduleType, method: HttpMethod.DELETE, url: `http://localhost:3000/api/schedule/${action.value}` });
        yield put(channelAction);
    });
}

export function* runSchedule() {
    yield takeEvery(RunScheduleType, function* (action: any) {
        const wsChannel = yield call(initScheduleWS, action.value);
        while (true) {
            const msgAction = yield take(wsChannel);
            yield put(msgAction);
        }
    });
}

function initScheduleWS(id: string) {
    return eventChannel(emitter => {
        const socket = new WebSocket('ws://localhost:3000/schedule');
        socket.onmessage = (ev: MessageEvent) => {
            console.log(ev);
            const data = JSON.parse(ev.data);
            if (data.isResult) {
                setTimeout(() => {
                    emitter(actionCreator(RunScheduleFulfillType, { id, data }));
                }, 1000);
            } else {
                emitter(actionCreator(ScheduleChunkDataType, { id, data }));
            }
        };
        socket.onopen = (ev: Event) => {
            socket.send(id);
        };
        socket.onclose = (ev: CloseEvent) => {
            setTimeout(() => {
                emitter(END);
            }, 2000);
        };
        socket.onerror = (ev: Event) => {
            console.error(ev);
            emitter(END);
        };
        return () => {
            console.log('close socket');
        };
    });
}