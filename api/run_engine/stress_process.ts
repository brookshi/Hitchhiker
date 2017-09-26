import 'reflect-metadata';
import { Setting } from '../utils/setting';
import { Log } from '../utils/log';
import * as net from 'net';
import * as WS from 'ws';
import { StressSetting } from '../interfaces/dto_stress_setting';
import * as _ from 'lodash';

Log.init();

process.on('message', (msg, data) => {
    if (msg === 'start') {
        startStressProcess();
    } else if (msg === 'task') {

    }
});

const stressNodes: _.Dictionary<{ socket: net.Socket, status: string }> = {};

const stressQueue: Array<{ id: string, socket: WS, setting: StressSetting }> = [];

function addTask(setting: { id: string, socket: WS, setting: StressSetting }) {
    stressQueue.push(setting);
    tryTriggerStart(setting);
}

function tryTriggerStart(setting) {
    if (_.values(stressNodes).some(n => n.status !== 'idle')) {
        return;
    }
    sendMsgToWorkers(setting);
}

function sendMsgToWorkers(setting) {
    _.values(stressNodes).forEach(n => n.socket.write(JSON.stringify(setting)));
}

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