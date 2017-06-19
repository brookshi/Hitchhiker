import * as WS from 'ws';

export abstract class WebSocketHandler {

    private socket: WS;

    handle(socket: WS) {
        socket.on('message', data => this.onReceive(data as string));
        socket.on('close', this.onClose);
    }

    abstract onReceive(data: string);

    abstract onClose();

    send(data: string) {
        console.log(`send data: ${data}`);
        this.socket.send(data);
    }

    close(data?: string) {
        console.log(`close connection`);
        this.socket.close(200, data);
    }
}