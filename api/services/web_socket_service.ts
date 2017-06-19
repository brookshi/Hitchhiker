import * as WS from 'ws';
import * as http from 'http';
import { ScheduleOndemandService } from "./schedule_ondemand_service";
import { WebSocketHandler } from "./base/web_socket_handler";

export class WebSocketService {

    private wsServer: WS.Server;

    private routes: { [key: string]: { new (): WebSocketHandler } };

    constructor(server: http.Server) {
        this.wsServer = new WS.Server({ server });
        this.use('/schedule', ScheduleOndemandService);
    }

    use(path: string, handler: { new (): WebSocketHandler }) {
        this.routes[path] = handler;
    }

    start() {
        this.wsServer.on('connection', (socket, req) => {
            const route = this.routes[req.url];
            if (!route) {
                socket.close(0, `no handler for ${req.url}`);
                return;
            }
            new route().handle(socket);
        });
    }
}