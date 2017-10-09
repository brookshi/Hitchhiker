import 'reflect-metadata';
import { Setting } from '../utils/setting';
import { Log } from '../utils/log';
import * as net from 'net';
import * as WS from 'ws';
import { StressRequest, StressUser, WorkerInfo, StressResponse, TestCase, StressMessage, StressResFailedInfo, Duration, StressResStatisticsTime, StressRunResult, StressResFailedStatistics } from '../interfaces/dto_stress_setting';
import * as _ from 'lodash';
import { StressMessageType, WorkerStatus, StressFailedType } from '../common/stress_type';
import { RunResult } from '../interfaces/dto_run_result';
import { StressRecordService } from '../services/stress_record_service';
import { StressRecord } from '../models/stress_record';
import { Stress } from '../models/stress';
import { StressFailedInfo } from '../models/stress_failed_info';
import { StressService } from '../services/stress_service';

type WorkerInfoEx = WorkerInfo & { socket: WS };

const goDurationRate = 1000000;

const workers: _.Dictionary<WorkerInfoEx> = {};

const stressQueue: Array<StressRequest> = [];

const users: _.Dictionary<StressUser> = {};

let stressReqDuration: _.Dictionary<{ durations: Duration[], statistics?: StressResStatisticsTime }> = {};

let stressFailedResult: StressResFailedInfo = { m500: {}, testFailed: {}, noRes: {} };

let currentStressRequest: StressRequest;

let startTime: [number, number];

Log.init();

console.log('stress process start');

console.log(`stress - create socket server`);
const wsServer = new WS.Server({ port: Setting.instance.stressPort });

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
    sendMsgToUser(StressMessageType.init, user);
}

function getCurrentRequestTotalCount() {
    const { repeat, concurrencyCount, requestBodyList } = currentStressRequest.testCase;
    return repeat * requestBodyList.length * concurrencyCount;
}

function tryTriggerStart(request?: StressRequest) {
    console.log(`stress - tryTriggerStart: ${JSON.stringify(request || '')}`);
    if (_.values(workers).some(n => n.status !== WorkerStatus.idle)) {
        console.log('stress - trigger start: not all worker idle');
        if (!!request) {
            console.log('stress - push to queue');
            stressQueue.push(request);
            broadcastMsgToUsers(StressMessageType.status);
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
    if (request.type === StressMessageType.task) {
        const allocableRequests = getAllocableRequest(request);
        _.keys(allocableRequests).forEach(k => workers[k].socket.send(JSON.stringify(allocableRequests[k])));
    } else {
        _.values(workers).forEach(w => w.socket.send(JSON.stringify(request)));
    }
}

function getAllocableRequest(request: Partial<StressRequest>) {
    const orderWorkers = _.orderBy(_.values(workers), 'cpuNum', 'desc');
    const totalCpuNum = _.sumBy(orderWorkers, 'cpuNum');
    const concurrencyPerCpu = request.testCase.concurrencyCount / totalCpuNum;
    const workerTaskCount = {};
    orderWorkers.forEach(w => {
        workerTaskCount[w.addr] = Math.floor(w.cpuNum * concurrencyPerCpu);
    });
    let leftConcurrencyCount = request.testCase.concurrencyCount - _.sum(_.values(workerTaskCount));
    orderWorkers.forEach(w => {
        if (workerTaskCount[w.addr] === 0 && leftConcurrencyCount > 0) {
            workerTaskCount[w.addr] = 1;
            leftConcurrencyCount--;
        }
    });
    orderWorkers.forEach(w => {
        if (leftConcurrencyCount > 0) {
            workerTaskCount[w.addr] = 1;
            leftConcurrencyCount--;
        }
    });
    const allocableRequestWorker = {};
    _.keys(workerTaskCount).forEach(k => {
        if (workerTaskCount[k] > 0) {
            console.log(`allocate ${k} task num: ${workerTaskCount[k]}`);
            allocableRequestWorker[k] = { ...request, testCase: { ...request.testCase, concurrencyCount: workerTaskCount[k] } };
        }
    });
    return allocableRequestWorker;
}

function sendMsgToUser(type: StressMessageType, user: StressUser, data?: any) {
    console.log(`stress ${type} - send msg to user ${user.id}`);
    if (!user) {
        console.log(`stress - user invalid`);
        return;
    }
    const res = { type, workerInfos: _.values(workers).map(w => ({ ...w, socket: undefined })), data, tasks: stressQueue.map(s => s.stressName), currentTask: currentStressRequest ? currentStressRequest.stressName : '', currentStressId: currentStressRequest ? currentStressRequest.stressId : '' } as StressResponse;
    console.log(`stress ${type} - send msg to user ${user.id}`);
    process.send({ id: user.id, data: res });
}

function broadcastMsgToUsers(type: StressMessageType, data?: any) {
    console.log(`stress ${type} - broadcast msg to user`);
    _.values(users).forEach(u => sendMsgToUser(type, u, data));
}

function startStressProcess() {
    wsServer.on('connection', (socket, req) => {
        const addr = req.connection.remoteAddress;
        workers[addr] = { addr: addr, socket, status: WorkerStatus.idle, cpuNum: Number.NaN };
        console.log(`stress - worker connected: ${addr}`);

        socket.on('message', data => {
            console.log(`stress - data from ${addr}`);
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
            broadcastMsgToUsers(StressMessageType.status);
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
    broadcastMsgToUsers(StressMessageType.status);
}

function workerStarted(addr: string) {
    workers[addr].status = WorkerStatus.working;
    console.log(`stress - worker ${addr} start`);
    broadcastMsgToUsers(StressMessageType.status);
}

function workerUpdated(addr: string, status: WorkerStatus) {
    console.log(`stress - status`);
    workers[addr].status = status;
    if (status === WorkerStatus.ready) {
        if (_.values(workers).every(w => w.status === WorkerStatus.ready)) {
            console.log(`stress - all workers ready`);
            sendMsgToWorkers({ type: StressMessageType.start });
            userUpdateTimer = setInterval(() => {
                sendMsgToUser(StressMessageType.runResult, currentStressRequest, buildStressRunResult());
            }, Setting.instance.stressUpdateInterval);
        }
    } else if (status === WorkerStatus.finish) {
        workers[addr].status = WorkerStatus.idle;
        if (!_.values(workers).some(w => w.status !== WorkerStatus.finish && w.status !== WorkerStatus.idle)) {
            console.log(`stress - all workers finish/idle`);
            const runResult = buildStressRunResult();
            sendMsgToUser(StressMessageType.finish, currentStressRequest, runResult);
            storeStressRecord(runResult, () => {
                reset();
                tryTriggerStart();
            });
        }
    } else if (status === WorkerStatus.working) {
        if (!startTime) {
            startTime = process.hrtime();
        }
    } else {
        console.error('miss condition');
    }
    broadcastMsgToUsers(StressMessageType.status);
}

async function storeStressRecord(runResult: StressRunResult, cb: () => void): Promise<void> {
    if (!currentStressRequest) {
        console.warn('invalid stress id');
        return;
    }
    try {
        const stress = await StressService.getById(currentStressRequest.stressId);
        stress.lastRunDate = new Date();
        await StressService.save(stress);
        console.log('clear stress redundant records');
        await StressRecordService.clearRedundantRecords(currentStressRequest.stressId);
        console.log('create new stress record');
        const stressRecord = new StressRecord();
        stressRecord.stress = new Stress();
        stressRecord.stress.id = currentStressRequest.stressId;
        stressRecord.result = runResult;
        const stressFailedInfo = new StressFailedInfo();
        stressFailedInfo.info = JSON.stringify(stressFailedResult);
        await StressRecordService.create(stressRecord, stressFailedInfo);
        console.log('store stress record success');
        cb();
    } catch (reason) {
        console.error(`store stress record failed: ${reason}`);
        cb();
    }
}

function workerTrace(runResult: RunResult) {
    const id = runResult.id + (runResult.param || '');
    stressReqDuration[id] = stressReqDuration[id] || { durations: [] };
    stressReqDuration[id].durations.push(runResult.duration);

    const failedType = getFailedType(runResult);
    if (failedType) {
        stressFailedResult[failedType][id] = stressFailedResult[failedType][id] || [];
        stressFailedResult[failedType][id].push(runResult);
    }
}

function getFailedType(runResult: RunResult) {
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
    currentStressRequest = undefined;
    stressReqDuration = {};
    stressFailedResult = { m500: {}, testFailed: {}, noRes: {} };
    clearInterval(userUpdateTimer);
}

function buildStressRunResult() {
    const totalCount = getCurrentRequestTotalCount();
    const doneCount = getDoneCount();
    const tps = doneCount / getPassedTime();
    const reqProgress = getRunProgress();
    buildDurationStatistics();
    return { totalCount, doneCount, tps, reqProgress, stressReqDuration, stressFailedResult: getFailedResultStatistics() };
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

function getFailedResultStatistics() {
    const statistics: StressResFailedStatistics = { m500: {}, noRes: {}, testFailed: {} };
    const build = (type: string) => _.keys(stressFailedResult[type]).forEach(k => statistics[type][k] = stressFailedResult[type][k].length);
    build('m500');
    build('noRes');
    build('testFailed');
    return statistics;
}

function getRunProgress() {
    const requestList = currentStressRequest.testCase.requestBodyList;
    const reqProgresses = requestList.map(r => ({ id: r.id + (r.param || ''), name: r.name, num: 0 }));
    let lastFinishCount = currentStressRequest.testCase.repeat * currentStressRequest.testCase.concurrencyCount;
    let id;
    for (let i = 0; i < requestList.length; i++) {
        id = requestList[i].id + (requestList[i].param || '');
        const currentReqCount = stressReqDuration[id] ? stressReqDuration[id].durations.length : 0;
        reqProgresses[i].num = lastFinishCount - currentReqCount;
        lastFinishCount = currentReqCount;
    }
    reqProgresses.push({ id: 'end', name: 'End', num: lastFinishCount });
    return reqProgresses;
}