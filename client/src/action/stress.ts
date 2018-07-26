import { Urls } from '../utils/urls';
import { StressResponse } from '../../../api/src/interfaces/dto_stress_setting';
import { StressMessageType } from '../common/stress_type';
import { takeEvery, put, takeLatest } from 'redux-saga/effects';
import { syncAction, actionCreator } from './index';
import { HttpMethod } from '../common/http_method';
import message from 'antd/lib/message';
import LocalesString from '../locales/string';

export const SaveStressType = 'save stress test';

export const DeleteStressType = 'delete stress test';

export const ActiveStressType = 'active stress test';

export const RunStressType = 'run stress test';

export const StopStressType = 'stop stress test';

export const StressChunkDataType = 'stress test chunk data';

export const StressStatusType = 'stress test status';

export const RunStressFulfillType = 'run stress test completely';

export class StressWS {

    static instance: StressWS = new StressWS();

    private socket: WebSocket;

    private dispatch: any;

    initStressWS(dispatch: any) {
        this.dispatch = dispatch;
        this.socket = new WebSocket(Urls.getWebSocket('stresstest'));
        this.socket.onmessage = (ev: MessageEvent) => {
            const data = JSON.parse(ev.data) as StressResponse;
            console.log(data);
            if (data.type === StressMessageType.error) {
                message.error(data);
                return;
            }
            if (data.type === StressMessageType.noWorker) {
                message.warning(data.data);
                return;
            }
            if (data.type === StressMessageType.runResult || data.type === StressMessageType.finish) {
                dispatch(actionCreator(StressChunkDataType, data));
                if (data.type === StressMessageType.finish) {
                    setTimeout(() => dispatch(actionCreator(RunStressFulfillType, data)), 2000);
                }
            } else {
                dispatch(actionCreator(StressStatusType, data));
            }
        };
        this.socket.onclose = () => {
            console.error(LocalesString.get('Stress.SocketError'));
            console.log(LocalesString.get('Stress.Reconnect'));
            setTimeout(() => this.initStressWS(this.dispatch), 3000);
        };
        this.socket.onerror = (ev: Event) => {
            console.error(LocalesString.get('Stress.ServerError'), ev);
        };
    }

    start(stressId: string) {
        if (!this.checkSocket()) {
            return;
        }
        this.socket.send(JSON.stringify({ type: StressMessageType.task, stressId }));
    }

    stop(stressId: string) {
        if (!this.checkSocket()) {
            return;
        }
        this.socket.send(JSON.stringify({ type: StressMessageType.stop, stressId }));
    }

    private checkSocket() {
        if (!this.socket || this.socket.readyState !== this.socket.OPEN) {
            console.error(LocalesString.get('Stress.SocketClose'));
            return false;
        }
        return true;
    }
}

export function* saveStress() {
    yield takeEvery(SaveStressType, function* (action: any) {
        const stress = { ...action.value.stress };
        Reflect.deleteProperty(stress, 'stressRecords');
        const channelAction = syncAction({ type: SaveStressType, method: action.value.isNew ? HttpMethod.POST : HttpMethod.PUT, url: Urls.getUrl(`stress`), body: { ...stress, stressRecords: [] } });
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
    yield takeLatest(RunStressType, function* (action: any) {
        StressWS.instance.start(action.value);
    });
}

export function* stopStress() {
    yield takeLatest(StopStressType, function* (action: any) {
        StressWS.instance.stop(action.value);
    });
}