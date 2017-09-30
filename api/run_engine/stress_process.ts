import 'reflect-metadata';
import { Setting } from '../utils/setting';
import { Log } from '../utils/log';
import * as net from 'net';
import * as WS from 'ws';
import { StressRequest, StressUser, WorkerInfo, StressResponse, TestCase, StressMessage } from '../interfaces/dto_stress_setting';
import * as _ from 'lodash';
import { StressMessageType, WorkerStatus } from '../common/stress_type';

type WorkerInfoEx = WorkerInfo & { socket: WS };

const workers: _.Dictionary<WorkerInfoEx> = {};

const stressQueue: Array<StressRequest> = [];

const users: _.Dictionary<StressUser> = {};

let currentStressRequest: StressRequest;

Log.init();

console.log('stress process start');

console.log(`stress - create socket server`);
const wsServer = new WS.Server({ port: Setting.instance.app.stressPort });

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
            tryTriggerStart(msg);
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

function tryTriggerStart(request?: StressRequest) {
    console.log(`stress - tryTriggerStart: ${JSON.stringify(request || '')}`);
    if (_.values(workers).some(n => n.status !== WorkerStatus.idle)) {
        console.log('stress - trigger start: not all worker idle');
        if (!!request) {
            process.send({ id: request.id, data: { type: StressMessageType.wait } });
            console.log('stress - push to queue');
            stressQueue.push(request);
        }
        return;
    }
    request = request || stressQueue.shift();
    if (!request) {
        console.log('stress - no request, return');
        return;
    }
    request.testCase.requestBodyList = [{ id: '1', method: 'GET', url: 'http://httpbin.org/get?a=1' }];
    currentStressRequest = request;
    console.log('stress - send msg to workers');
    sendMsgToWorkers(request);
}

function sendMsgToWorkers(request: Partial<StressRequest>) {
    _.values(workers).forEach(n => n.socket.send(JSON.stringify(request)));
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
    wsServer.on('connection', (socket, req) => {
        const addr = req.connection.remoteAddress;
        workers[addr] = { addr: addr, socket, status: WorkerStatus.idle, cpuNum: Number.NaN };
        console.log(`stress - worker connected: ${addr}`);

        socket.on('message', data => {
            console.log(`stress - data from ${addr}: ${data.toString()}`);
            const obj = JSON.parse(data.toString()) as StressMessage;
            switch (obj.type) {
                case StressMessageType.hardware:
                    workerInited(addr, obj.cpuNum, obj.status);
                    socket.send('{"hello":"h"}');
                    break;
                case StressMessageType.status:
                    workerUpdated(addr, obj.status);
                    break;
                case StressMessageType.start:
                    workerStarted(addr);
                    break;
                default:
                    break;
            }
        });

        socket.on('close', hadErr => {
            console.log(`stress - closed: ${addr}`);
            Reflect.deleteProperty(workers, addr);
            broadcastMsgToUsers();
        });

        socket.on('error', err => {
            console.log(`stress - error ${addr}: ${err}`);
        });
    });
    // net.createServer(socket => {

    //     workers[socket.remoteAddress] = { addr: socket.remoteAddress, socket, status: WorkerStatus.idle, cpuNum: Number.NaN };
    //     console.log(`stress - worker connected: ${socket.remoteAddress}`);

    //     socket.on('data', data => {
    //         const addr = socket.remoteAddress;
    //         console.log(`stress - data from ${addr}: ${data.toString()}`);
    //         const obj = JSON.parse(data.toString()) as StressMessage;
    //         switch (obj.type) {
    //             case StressMessageType.hardware:
    //                 workerInited(addr, obj.cpuNum, obj.status);
    //                 socket.write('hello');
    //                 break;
    //             case StressMessageType.status:
    //                 workerUpdated(addr, obj.status);
    //                 break;
    //             case StressMessageType.start:
    //                 workerStarted(addr);
    //                 break;
    //             default:
    //                 break;
    //         }
    //     });

    //     socket.on('close', hadErr => {
    //         console.log(`stress - closed: ${socket.remoteAddress}`);
    //         Reflect.deleteProperty(workers, socket.remoteAddress);
    //         broadcastMsgToUsers();
    //     });

    //     socket.on('error', err => {
    //         console.log(`stress - error ${socket.remoteAddress}: ${err}`);
    //     });

    //     socket.on('timeout', () => {
    //         console.log(`stress - timeout: ${socket.remoteAddress}`);
    //         Reflect.deleteProperty(workers, socket.remoteAddress);
    //         broadcastMsgToUsers();
    //     });
    // }).listen(Setting.instance.app.stressPort);
}

function workerInited(addr: string, cpu: number, status: WorkerStatus) {
    console.log(`stress - hardware`);
    workers[addr].cpuNum = cpu;
    workers[addr].status = status;
    broadcastMsgToUsers();
}

function workerStarted(addr: string) {
    workers[addr].status = WorkerStatus.working;
    console.log(`stress - worker ${addr} start`);
    broadcastMsgToUsers();
}

function workerUpdated(addr: string, status: WorkerStatus) {
    console.log(`stress - status`);
    workers[addr].status = status;
    broadcastMsgToUsers();
    if (status === WorkerStatus.ready) {
        if (!_.values(workers).some(w => w.status !== WorkerStatus.ready)) {
            console.log(`stress - all workers ready`);
            sendMsgToWorkers({ type: StressMessageType.start });
        }
    } else if (status === WorkerStatus.finish) {
        workers[addr].status = WorkerStatus.idle;
        if (!_.values(workers).some(w => w.status !== WorkerStatus.finish && w.status !== WorkerStatus.idle)) {
            console.log(`stress - all workers finish/idle`);
            tryTriggerStart();
        }
    }
}