import 'reflect-metadata';
import { Setting } from '../utils/setting';
import { Log } from '../utils/log';
import * as net from 'net';
import * as WS from 'ws';
import { StressRequest, StressUser, WorkerInfo, StressResponse, TestCase, StressMessage, StressResFailedStatus, Duration, StressResStatisticsTime, StressRunResult } from '../interfaces/dto_stress_setting';
import * as _ from 'lodash';
import { StressMessageType, WorkerStatus, StressFailedType } from '../common/stress_type';
import { RunResult } from '../interfaces/dto_run_result';

type WorkerInfoEx = WorkerInfo & { socket: WS };

const goDurationRate = 1000000;

const workers: _.Dictionary<WorkerInfoEx> = {};

const stressQueue: Array<StressRequest> = [];

const users: _.Dictionary<StressUser> = {};

let stressReqDuration: _.Dictionary<{ durations: Duration[], statistics?: StressResStatisticsTime }> = {};

let stressFailedResult: StressResFailedStatus = { m500: {}, testFailed: {}, noRes: {} };

let currentStressRequest: StressRequest;

let startTime: [number, number];

Log.init();

console.log('stress process start');

console.log(`stress - create socket server`);
const wsServer = new WS.Server({ port: Setting.instance.app.stressPort });

let userUpdateTimer: number;

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

function getCurrentRequestTotalCount() {
    const { totalCount, requestBodyList } = currentStressRequest.testCase;
    return totalCount * requestBodyList.length;
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
                    break;
                case StressMessageType.status:
                    workerUpdated(addr, obj.status);
                    break;
                case StressMessageType.runResult:
                    workerTrace(obj.runResult);
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
    if (status === WorkerStatus.ready) {
        if (!_.values(workers).some(w => w.status !== WorkerStatus.ready)) {
            console.log(`stress - all workers ready`);
            sendMsgToWorkers({ type: StressMessageType.start });
            userUpdateTimer = setInterval(() => {
                sendDataToUser();
            }, Setting.instance.app.stressUpdateInterval);
        }
    } else if (status === WorkerStatus.finish) {
        workers[addr].status = WorkerStatus.idle;
        if (!_.values(workers).some(w => w.status !== WorkerStatus.finish && w.status !== WorkerStatus.idle)) {
            console.log(`stress - all workers finish/idle`);
            sendDataToUser();
            reset();
            tryTriggerStart();
        }
    } else if (status === WorkerStatus.working) {
        if (!startTime) {
            startTime = process.hrtime();
        }
    } else {
        console.error('miss condition');
    }
    broadcastMsgToUsers();
}

function workerTrace(runResult: RunResult) {
    const id = runResult.id;
    stressReqDuration[id] = stressReqDuration[id] || { durations: [] };
    stressReqDuration[id].durations.push(runResult.duration);

    const failedType = getFaildType(runResult);
    if (failedType) {
        stressFailedResult[failedType][runResult.id] = stressFailedResult[failedType][runResult.id] || [];
        stressFailedResult[failedType][runResult.id].push(runResult);
    }
}

function getFaildType(runResult: RunResult) {
    if (runResult.status >= 500) {
        return StressFailedType.m500;
    } else if (runResult.error.message) {
        return StressFailedType.noRes;
    } else if (_.values(runResult.tests).some(v => !v)) {
        return StressFailedType.testFailed;
    }

    return undefined;
}

function reset() {
    startTime = undefined;
    stressReqDuration = {};
    stressFailedResult = { m500: {}, testFailed: {}, noRes: {} };
    clearInterval(userUpdateTimer);
}

function sendDataToUser() {
    const totalCount = getCurrentRequestTotalCount();
    const doneCount = getDoneCount();
    const tps = doneCount / getPassedTime();
    const reqProgress = getRunProgress();
    buildDurationStatistics();
    sendMsgToUser(currentStressRequest, <StressRunResult>{ totalCount, doneCount, tps, reqProgress, stressReqDuration, stressFailedResult });
}

function getDoneCount() {
    return _.keys(stressReqDuration).map(k => stressReqDuration[k].durations.length).reduce((p, c) => p + c, 0);
}

function getPassedTime() {
    return !startTime ? 0 : (process.hrtime(startTime)[0] * 1000 + _.toInteger(process.hrtime(startTime)[1] / 1000000)) / 1000;
}

function buildDurationStatistics() {
    _.values(stressReqDuration).forEach(d => {
        const reqElapse = _.sortBy(d.durations.map(t => (t.connect + t.dns + t.request) / goDurationRate));
        d.statistics = {
            averageConnect: d.durations.map(t => t.connect).reduce((p, c) => p + c) / (goDurationRate * d.durations.length),
            averageDns: d.durations.map(t => t.dns).reduce((p, c) => p + c) / (goDurationRate * d.durations.length),
            averageRequest: d.durations.map(t => t.request).reduce((p, c) => p + c) / (goDurationRate * d.durations.length),
            high: reqElapse[reqElapse.length - 1],
            low: reqElapse[0],
            p50: reqElapse[Math.floor(reqElapse.length * 0.5)],
            p75: reqElapse[Math.floor(reqElapse.length * 0.75)],
            p90: reqElapse[Math.floor(reqElapse.length * 0.9)],
            p95: reqElapse[Math.floor(reqElapse.length * 0.95)],
        };
    });
}

function getRunProgress() {
    const requestList = currentStressRequest.testCase.requestBodyList;
    const reqProgresses = requestList.map(r => ({ id: r.id + r.param, name: r.name, num: 0 }));
    let lastFinishCount = currentStressRequest.testCase.totalCount;
    let id;
    for (let i = 0; i < requestList.length; i++) {
        id = requestList[i].id + requestList[i].param;
        const currentReqCount = stressReqDuration[id] ? stressReqDuration[id].durations.length : 0;
        reqProgresses[i].num = lastFinishCount - currentReqCount;
        lastFinishCount = currentReqCount;
    }
    reqProgresses.push({ id: 'end', name: 'End', num: lastFinishCount })
    return reqProgresses;
}