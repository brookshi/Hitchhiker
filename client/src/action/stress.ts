import { Urls } from '../utils/urls';

export class StressWS {

    static instance: StressWS = new StressWS();

    private socket: WebSocket;

    initStressWS() {
        this.socket = new WebSocket(Urls.getWebSocket('stresstest'));
        this.socket.onmessage = (ev: MessageEvent) => {
            const data = JSON.parse(ev.data);
            console.log(data);
        };
        this.socket.onclose = (ev: CloseEvent) => {
            console.error('stress test server error');
        };
        this.socket.onerror = (ev: Event) => {
            console.error('stress test server error', ev);
        };
    }
}