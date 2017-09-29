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

let currentStressRequest: StressRequest;

Log.init();

console.log('stress process start');

process.on('message', (msg: StressRequest) => {
    console.log(`stress - user message: ${JSON.stringify(msg)}`);
    switch (msg.type) {
        case StressMessageType.init:
            console.log('stress - user init');
            initUser({ ...<StressUser>msg });
            break;
        case StressMessageType.start:
            console.log('stress - user start');
            startStressProcess();
            break;
        case StressMessageType.task:
            console.log('stress - user task');
            sendMsgToWorkers(msg);
            break;
        case StressMessageType.close:
            console.log('stress - user close');
            Reflect.deleteProperty(users, msg.id);
            currentStressRequest = undefined;
            break;
        case StressMessageType.stop:
            console.log('stress - user stop');
            sendMsgToWorkers(msg);
            currentStressRequest = undefined;
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
    tryTriggerStart(setting);
}

function tryTriggerStart(setting?: StressRequest) {
    console.log(`stress - tryTriggerStart: ${JSON.stringify(setting || '')}`);
    if (_.values(workers).some(n => n.status !== WorkerStatus.idle)) {
        console.log('stress - trigger start: not all worker idle');
        if (!!setting) {
            process.send({ id: setting.id, data: { type: StressMessageType.wait } });
            console.log('stress - push to queue');
            stressQueue.push(setting);
        }
        return;
    }
    setting = setting || stressQueue.shift();
    if (!setting) {
        console.log('stress - no setting, return');
        return;
    }
    currentStressRequest = setting;
    console.log('stress - send msg to workers');
    sendMsgToWorkers(setting);
}

function sendMsgToWorkers(setting) {
    _.values(workers).forEach(n => n.socket.write(JSON.stringify(setting)));
}

function sendMsgToUser(user: StressUser, data?: any) {
    console.log(`stress - send msg to user ${user.id}: ${JSON.stringify(data || '')}`);
    if (!user) {
        console.log(`stress - user invalid`);
        return;
    }
    const res = { type: StressMessageType.status, workerInfos: _.values(workers).map(w => ({ ...w, socket: undefined })), data } as StressResponse;
    console.log(`stress - send msg to user ${user.id}: ${JSON.stringify(res)}`);
    process.send({ id: user.id, data: res });
}

function broadcastMsgToUsers(data?: any) {
    console.log(`stress - broadcast msg to user: ${JSON.stringify(data || '')}`);
    _.values(users).forEach(u => sendMsgToUser(u, data));
}

function startStressProcess() {
    console.log(`stress - create socket server`);
    net.createServer(socket => {

        workers[socket.remoteAddress] = { addr: socket.remoteAddress + "," + socket.remoteFamily, socket, status: WorkerStatus.idle, cpuNum: Number.NaN };
        console.log(`stress - worker connected: ${socket.remoteAddress}`);

        socket.on('data', data => {
            console.log(`stress - data from ${socket.remoteAddress}: ${data.toString()}`);
            const obj = JSON.parse(data.toString()) as StressMessage;
            switch (obj.code) {
                case StressMessageType.hardware:
                    console.log(`stress - hardware`);
                    workers[socket.remoteAddress].cpuNum = obj.cpuNum;
                    workers[socket.remoteAddress].status = obj.status;
                    broadcastMsgToUsers();
                    break;
                case StressMessageType.status:
                    console.log(`stress - status`);
                    workers[socket.remoteAddress].status = obj.status;
                    broadcastMsgToUsers();
                    if (obj.status === WorkerStatus.ready) {
                        if (!_.values(workers).some(w => w.status !== WorkerStatus.ready)) {
                            console.log(`stress - all workers ready`);
                            sendMsgToWorkers({ code: StressMessageType.start });
                        }
                    } else if (obj.status === WorkerStatus.finish) {
                        if (!_.values(workers).some(w => w.status !== WorkerStatus.finish && w.status !== WorkerStatus.idle)) {
                            console.log(`stress - all workers finish/idle`);
                            tryTriggerStart();
                        }
                    }
                    break;
                case StressMessageType.start:
                    workers[socket.remoteAddress].status = WorkerStatus.working;
                    console.log(`stress - worker ${socket.remoteAddress} start`);
                    broadcastMsgToUsers();
                    break;
                default:
                    break;
            }
        });

        socket.on('close', hadErr => {
            console.log(`stress - closed: ${socket.remoteAddress}`);
            Reflect.deleteProperty(workers, socket.remoteAddress);
            broadcastMsgToUsers();
        });

        socket.on('error', err => {
            console.log(`stress - error ${socket.remoteAddress}: ${err}`);
        });

        socket.on('timeout', () => {
            console.log(`stress - timeout: ${socket.remoteAddress}`);
            Reflect.deleteProperty(workers, socket.remoteAddress);
            broadcastMsgToUsers();
        });
    }).listen(Setting.instance.app.stressPort);
}