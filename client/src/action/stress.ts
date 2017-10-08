import { Urls } from '../utils/urls';
import { StressResponse } from '../../../api/interfaces/dto_stress_setting';
import { StressMessageType } from '../common/stress_type';
import { takeEvery, put } from 'redux-saga/effects';
import { syncAction, actionCreator } from './index';
import { HttpMethod } from '../common/http_method';
import { Dispatch } from 'react-redux';
import { message } from 'antd';

export const SaveStressType = 'save stress test';

export const DeleteStressType = 'delete stress test';

export const ActiveStressType = 'active stress test';

export const RunStressType = 'run stress test';

export const StressChunkDataType = 'stress test chunk data';

export const StresStatusType = 'stress test status';

export const RunStressFulfillType = 'run stress test completely';

export class StressWS {

    static instance: StressWS = new StressWS();

    private socket: WebSocket;

    private dispatch: Dispatch<any>;

    initStressWS(dispatch: Dispatch<any>) {
        this.dispatch = dispatch;
        this.socket = new WebSocket(Urls.getWebSocket('stresstest'));
        this.socket.onmessage = (ev: MessageEvent) => {
            const data = JSON.parse(ev.data) as StressResponse;
            console.log(data);
            if (data.type === StressMessageType.error) {
                message.error(data);
                return;
            }
            if (data.type === StressMessageType.runResult || data.type === StressMessageType.finish) {
                dispatch(actionCreator(StressChunkDataType, data));
            } else {
                dispatch(actionCreator(StresStatusType, data));
            }
        };
        this.socket.onclose = (ev: CloseEvent) => {
            console.error('stress test server error');
        };
        this.socket.onerror = (ev: Event) => {
            console.error('stress test server error', ev);
        };
    }

    start(stressId: string) {
        if (!this.socket || this.socket.readyState !== this.socket.OPEN) {
            console.error('socket is closed, please refresh to connect');
            return;
        }
        this.socket.send(JSON.stringify({ type: StressMessageType.task, stressId }));
    }
}

export function* saveStress() {
    yield takeEvery(SaveStressType, function* (action: any) {
        const channelAction = syncAction({ type: SaveStressType, method: action.value.isNew ? HttpMethod.POST : HttpMethod.PUT, url: Urls.getUrl(`stress`), body: action.value.stress });
        yield put(channelAction);
    });
}

export function* deleteStress() {
    yield takeEvery(DeleteStressType, function* (action: any) {
        const channelAction = syncAction({ type: DeleteStressType, method: HttpMethod.DELETE, url: Urls.getUrl(`stress/${action.value}`) });
        yield put(channelAction);
    });
}

export function* runStress() {
    yield takeEvery(RunStressType, function* (action: any) {
        StressWS.instance.start(action.value);
    });
}