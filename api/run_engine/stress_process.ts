import 'reflect-metadata';
import { Setting } from '../utils/setting';
import { Log } from '../utils/log';
import * as net from 'net';

Log.init();

process.on('message', (msg) => {
    if (msg === 'start') {
        startStressProcess();
    }
});

const streeNodes: _.Dictionary<{ status?: string }> = {};

function startStressProcess() {
    net.createServer(socket => {

        streeNodes[socket.remoteAddress] = streeNodes[socket.remoteAddress] || {};
        streeNodes[socket.remoteAddress].status = 'connect';
        Log.info(`Connect: ${socket.remoteAddress}`);

        socket.on('data', data => {

        });

        socket.on('close', hadErr => {

        });

        socket.on('error', err => {

        });

        socket.on('timeout', () => {

        });
    });
}