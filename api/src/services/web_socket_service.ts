import * as WS from 'ws';
import * as http from 'http';
import { ScheduleOnDemandService } from './schedule_on_demand_service';
import { WebSocketHandler } from './base/web_socket_handler';
import { StressTestWSService } from './stress_test_ws_service';

export class WebSocketService {

    private wsServer: WS.Server;

    private routes: { [key: string]: { new(): WebSocketHandler } } = {};

    constructor(server: http.Server) {
        this.wsServer = new WS.Server({ server });
        this.use('/schedule', ScheduleOnDemandService);
        this.use('/stresstest', StressTestWSService);
    }

    use(path: string, handler: { new(): WebSocketHandler }) {
        this.routes[path] = handler;
    }

    start() {
        this.wsServer.on('connection', (socket, req) => {
            const route = this.routes[req.url];
            if (!route) {
                socket.close(1000, `no handler for ${req.url}`);
                return;
            }
            new route().handle(socket);
        });
    }
}