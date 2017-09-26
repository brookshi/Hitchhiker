import 'reflect-metadata';
import { Setting } from '../utils/setting';
import { Log } from '../utils/log';
import * as net from 'net';

Log.init();

process.on('message', (msg) => {
    if (msg === 'start') {
        startStressProcess();
    } else if (msg === 'task') {

    }
});

const stressNodes: _.Dictionary<{ socket: net.Socket, status: string }> = {};

function startStressProcess() {
    net.createServer(socket => {

        stressNodes[socket.remoteAddress] = { socket, status: 'Connect' };
        Log.info(`Connected: ${socket.remoteAddress}`);

        socket.on('data', data => {

        });

        socket.on('close', hadErr => {
            Log.info(`Closed: ${socket.remoteAddress}`);
            Reflect.deleteProperty(stressNodes, socket.remoteAddress);
        });

        socket.on('error', err => {
            Log.info(`Error: ${socket.remoteAddress}`);
            Reflect.deleteProperty(stressNodes, socket.remoteAddress);
        });

        socket.on('timeout', () => {
            Log.info(`Timeout: ${socket.remoteAddress}`);
            Reflect.deleteProperty(stressNodes, socket.remoteAddress);
        });
    });
}