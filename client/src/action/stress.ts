import { Urls } from '../utils/urls';
import { StressRequest, StressResponse } from '../../../api/interfaces/dto_stress_setting';
import { StressMessageType } from '../common/stress_type';

export class StressWS {

    static instance: StressWS = new StressWS();

    private socket: WebSocket;

    initStressWS() {
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

    start() {
        if (!this.socket || this.socket.readyState !== this.socket.OPEN) {
            console.error('socket is closed, please refresh to connect');
            return;
        }
        this.socket.send(JSON.stringify({ type: StressMessageType.task, stressId: '', testCase: { totalCount: 10, concurrencyCount: 1, qps: 0, timeout: 600 } } as StressRequest));
    }
} 