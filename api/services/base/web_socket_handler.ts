import * as WS from 'ws';

export abstract class WebSocketHandler {

    private socket: WS;

    handle = (socket: WS) => {
        this.socket = socket;
        socket.on('message', data => this.onReceive(data as string));
        socket.on('close', this.onClose);
    }

    abstract onReceive(data: string);

    abstract onClose();

    send = (data: string) => {
        console.log(`send data: ${data}`);
        this.socket.send(data);
    }

    close = (data?: string) => {
        this.socket.close(1000, data);
    }
}