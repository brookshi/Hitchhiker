import { Urls } from '../utils/urls';

export class StressWS {

    static instance: StressWS = new StressWS();

    private socket: WebSocket;

    initStressWS() {
        this.socket = new WebSocket(Urls.getWebSocket('stresstest'));
        this.socket.onmessage = (ev: MessageEvent) => {
            const data = JSON.parse(ev.data);
            if (data.isResult) {
                setTimeout(() => {
                    //emitter(actionCreator(RunScheduleFulfillType, { id, data }));
                }, 1000);
            } else {
                //emitter(actionCreator(ScheduleChunkDataType, { id, data }));
            }
        };
        this.socket.onopen = (ev: Event) => {
            //socket.send(id);
        };
        this.socket.onclose = (ev: CloseEvent) => {
            setTimeout(() => {
                // emitter(END);
            }, 2000);
        };
        this.socket.onerror = (ev: Event) => {
            console.error(ev);
            // emitter(END);
        };
    }
}