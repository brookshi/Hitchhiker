import { takeEvery, put } from 'redux-saga/effects';
import { syncAction, actionCreator } from './index';
import { HttpMethod } from '../common/http_method';
import { delay } from 'redux-saga';

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
        const socket = new WebSocket('ws://localhost:3000/schedule');
        socket.onmessage = function* (ev: MessageEvent) {
            console.log(ev);
            yield put(actionCreator(ScheduleChunkDataType, ev.data));
        };
        socket.onopen = function* (ev: Event) {
            socket.send(action.value);
        };
        socket.onclose = function* (ev: CloseEvent) {
            console.log(ev);
            yield delay(2000);
            yield put(actionCreator(RunScheduleFulfillType, ev));
        };
    });
}