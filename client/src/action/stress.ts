import { Urls } from '../utils/urls';
import { StressRequest, StressResponse } from '../../../api/interfaces/dto_stress_setting';
import { StressMessageType } from '../common/stress_type';
import { takeEvery, put } from 'redux-saga/effects';
import { syncAction } from './index';
import { HttpMethod } from '../common/http_method';
import { Dispatch } from 'react-redux';

export const SaveStressType = 'save stress test';

export const DeleteStressType = 'delete stress test';

export const ActiveStressType = 'active stress test';

export const RunStressType = 'run stress test';

export const StressChunkDataType = 'stress test chunk data';

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
        };
        this.socket.onclose = (ev: CloseEvent) => {
            console.error('stress test server error');
        };
        this.socket.onerror = (ev: Event) => {
            console.error('stress test server error', ev);
        };
    }

    // initStressWS() {
    //     return eventChannel(emitter => {
    //         this.socket = new WebSocket(Urls.getWebSocket('stresstest'));
    //         this.socket.onmessage = (ev: MessageEvent) => {
    //             const data = JSON.parse(ev.data) as StressResponse;
    //             console.log(data);
    //         };
    //         this.socket.onclose = (ev: CloseEvent) => {
    //             setTimeout(() => {
    //                 emitter(END);
    //             }, 2000);
    //         };
    //         this.socket.onerror = (ev: Event) => {
    //             console.error(ev);
    //             emitter(END);
    //         };
    //         return () => { return true; };
    //     });
    // }

    start() {
        if (!this.socket || this.socket.readyState !== this.socket.OPEN) {
            console.error('socket is closed, please refresh to connect');
            return;
        }
        this.socket.send(JSON.stringify({ type: StressMessageType.task, stressId: '', testCase: { totalCount: 100, concurrencyCount: 100, qps: 0, timeout: 600 } } as StressRequest));
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
        // const wsChannel = yield call(initStressWS, action.value);
        // while (true) {
        //     const msgAction = yield take(wsChannel);
        //     yield put(msgAction);
        // }
    });
}