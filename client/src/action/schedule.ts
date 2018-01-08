import { takeEvery, put, call, take } from 'redux-saga/effects';
import { syncAction, actionCreator } from './index';
import { HttpMethod } from '../common/http_method';
import { eventChannel, END } from 'redux-saga';
import { Urls } from '../utils/urls';

export const SaveScheduleType = 'save schedule';

export const DeleteScheduleType = 'delete schedule';

export const ActiveScheduleType = 'active schedule';

export const RunScheduleType = 'run schedule';

export const SetScheduleRecordsModeType = 'set schedule records display mode';

export const SetScheduleRecordsPageType = 'set schedule records page';

export const SetScheduleRecordsExcludeNotExistType = 'set schedule records statistics exclude not exist';

export const ScheduleChunkDataType = 'schedule chunk data';

export const RunScheduleFulfillType = 'run schedule completely';

export function* saveSchedule() {
    yield takeEvery(SaveScheduleType, function* (action: any) {
        const channelAction = syncAction({ type: SaveScheduleType, method: action.value.isNew ? HttpMethod.POST : HttpMethod.PUT, url: Urls.getUrl(`schedule`), body: { ...action.value.schedule, scheduleRecords: [] } });
        yield put(channelAction);
    });
}

export function* deleteSchedule() {
    yield takeEvery(DeleteScheduleType, function* (action: any) {
        const channelAction = syncAction({ type: DeleteScheduleType, method: HttpMethod.DELETE, url: Urls.getUrl(`schedule/${action.value}`) });
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
        const socket = new WebSocket(Urls.getWebSocket('schedule'));
        socket.onmessage = (ev: MessageEvent) => {
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
        return () => { return true; };
    });
}