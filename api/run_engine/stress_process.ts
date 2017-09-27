import 'reflect-metadata';
import { Setting } from '../utils/setting';
import { Log } from '../utils/log';
import * as net from 'net';
import * as WS from 'ws';
import { StressRequest, StressUser, WorkerInfo, StressResponse, StressSetting, StressMessage, StressMessageType, WorkerStatus } from '../interfaces/dto_stress_setting';
import * as _ from 'lodash';

type WorkerInfoEx = WorkerInfo & { socket: net.Socket };

const workers: _.Dictionary<WorkerInfoEx> = {};

const stressQueue: Array<StressRequest> = [];

const users: _.Dictionary<StressUser> = {};

let currentStressUser: StressRequest;

Log.init();

process.on('message', (msg: StressRequest) => {
    switch (msg.type) {
        case StressMessageType.init:
            initUser(msg);
            break;
        case StressMessageType.start:
            startStressProcess();
            break;
        case StressMessageType.task:
            sendMsgToWorkers(msg);
            break;
        case StressMessageType.close:
            Reflect.deleteProperty(users, msg.id);
            currentStressUser = undefined;
            break;
        case StressMessageType.stop:
            sendMsgToWorkers(msg);
            currentStressUser = undefined;
            break;
        default:
            break;
    }
});

function initUser(user: StressUser) {
    users[user.id] = user;
    sendMsgToUser(user);
}

function addTask(setting: StressRequest) {
    stressQueue.push(setting);
    tryTriggerStart(setting);
}

function tryTriggerStart(setting: StressRequest) {
    setting = setting || stressQueue.shift();
    if (!setting) {
        return;
    }
    if (_.values(workers).some(n => n.status !== WorkerStatus.idle)) {
        setting.socket.send(JSON.stringify({ type: StressMessageType.wait }));
        return;
    }
    currentStressUser = setting;
    sendMsgToWorkers(setting);
}

function sendMsgToWorkers(setting) {
    _.values(workers).forEach(n => n.socket.write(JSON.stringify(setting)));
}

function sendMsgToUser(user: StressUser, data?: any) {
    if (!user || !user.socket) {
        return;
    }
    const res = { workerInfos: _.values(workers).map(w => w as WorkerInfo), data } as StressResponse;
    user.socket.send(JSON.stringify(res));
}

function broadcastMsgToUsers(data?: any) {
    _.values(users).forEach(u => sendMsgToUser(u, data));
}

function startStressProcess() {
    net.createServer(socket => {

        workers[socket.remoteAddress] = { addr: socket.remoteAddress, socket, status: WorkerStatus.idle, cpuNum: Number.NaN };
        Log.info(`Connected: ${socket.remoteAddress}`);

        socket.on('data', data => {
            Log.info(data.toString());
            const obj = JSON.parse(data.toString()) as StressMessage;
            switch (obj.code) {
                case StressMessageType.hardware:
                    workers[socket.remoteAddress].cpuNum = obj.cpuNum;
                    broadcastMsgToUsers();
                    break;
                case StressMessageType.status:
                    workers[socket.remoteAddress].status = obj.status;
                    broadcastMsgToUsers();
                    if (obj.status === WorkerStatus.ready) {
                        if (!_.values(workers).some(w => w.status !== WorkerStatus.ready)) {
                            sendMsgToWorkers({ code: StressMessageType.start });
                        }
                    }
                    break;
                case StressMessageType.start:
                    workers[socket.remoteAddress].status = WorkerStatus.working;
                    broadcastMsgToUsers();
                    break;
                default:
                    break;
            }
        });

        socket.on('close', hadErr => {
            Log.info(`Closed: ${socket.remoteAddress}`);
            Reflect.deleteProperty(workers, socket.remoteAddress);
        });

        socket.on('error', err => {
            Log.info(`Error: ${socket.remoteAddress}`);
            Reflect.deleteProperty(workers, socket.remoteAddress);
        });

        socket.on('timeout', () => {
            Log.info(`Timeout: ${socket.remoteAddress}`);
            Reflect.deleteProperty(workers, socket.remoteAddress);
        });
    });
}