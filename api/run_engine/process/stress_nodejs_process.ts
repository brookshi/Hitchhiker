import { Setting } from '../../utils/setting';
import * as WS from 'ws';
import * as OS from 'os';
import * as path from 'path';
import { Log } from '../../utils/log';
import { StressMessage, TestCase, StressRequest } from '../../interfaces/dto_stress_setting';
import { WorkerStatus, StressMessageType } from '../../common/stress_type';
import { RunResult } from '../../interfaces/dto_run_result';
import { ChildProcessManager } from './child_process_manager';
import { StressNodejsProcessHandler } from './stress_nodejs_process_handler';
import { MathUtil } from '../../utils/math_util';

const restartDelay: number = 10 * 1000;

Log.init();

let ws = createWS();

function createWS(): WS {
    return new WS(Setting.instance.stressHost);
}

ws.on('open', function open() {
    Log.info('connect success');
    send(createMsg(WorkerStatus.idle, StressMessageType.hardware, null, OS.cpus().length));
});

ws.on('message', data => {
    Log.info(`receive case: ${data}`);
    const obj = JSON.parse(data.toString()) as StressMessage;
});

ws.on('close', (code, msg) => {
    Log.error(`nodejs runner close ${code}: ${msg}`);
    setTimeout(() => ws = createWS(), restartDelay);
});

function send(msg: StressMessage) {
    Log.info(`send message with type ${msg.type} and status: ${msg.status}`);
    ws.send(msg);
}

let testCase: TestCase;
const processManager = ChildProcessManager.create('stress_nodejs', { count: OS.cpus().length, entry: path.join(__dirname, '../stress_nodejs_runner.js'), handlerCtor: StressNodejsProcessHandler });

function handMsg(msg: StressRequest) {
    switch (msg.type) {
        case StressMessageType.task:
            testCase = msg.testCase;
            send(createMsg(WorkerStatus.ready, StressMessageType.status));
            Log.info('status: ready');
            break;
        case StressMessageType.start:
            Log.info('status: start');
            send(createMsg(WorkerStatus.working, StressMessageType.status));
            run();
            break;
        case StressMessageType.finish:
            Log.info('status: file finish');
            send(createMsg(WorkerStatus.fileReady, StressMessageType.status));
            break;
        case StressMessageType.stop:
            finish();
            break;
        default:
            break;
    }
}

function run() {
    processManager.init();
    const taskForProcessArr = MathUtil.distribute(testCase.concurrencyCount, OS.cpus().length);
    const handler = processManager.getHandler('stress_nodejs');
    if (handler instanceof Array) {
        handler.forEach((h, i) => {
            h.process.send({
                type: StressMessageType.task,
                testCase: { ...testCase, concurrencyCount: taskForProcessArr[i] }
            });
        });
    }
}

function finish() {
    processManager.closeAll();
}

function trace(rst: RunResult) {
    send(createMsg(WorkerStatus.working, StressMessageType.runResult, rst));
}

function createMsg(status: WorkerStatus, type: StressMessageType, runResult: RunResult = null, cpuNum: number = 0): StressMessage {
    return { status, type, runResult, cpuNum };
}