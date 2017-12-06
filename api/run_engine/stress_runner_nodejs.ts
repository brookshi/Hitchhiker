import { Setting } from '../utils/setting';
import * as WS from 'ws';
import * as OS from 'os';
import { Log } from '../utils/log';
import { StressMessage, TestCase, StressRequest } from '../interfaces/dto_stress_setting';
import { WorkerStatus, StressMessageType } from '../common/stress_type';
import { RunResult } from '../interfaces/dto_run_result';

const restartDelay: number = 10 * 1000;

let ws = createWS();

function createWS(): WS {
    return new WS(Setting.instance.stressHost);
}

ws.on('open', function open() {
    Log.info('connect success');
    const msg: StressMessage = {
        status: WorkerStatus.idle,
        type: StressMessageType.hardware,
        runResult: null,
        cpuNum: OS.cpus().length
    };

    send(msg);
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
function handMsg(msg: StressRequest) {
    switch (msg.type) {
        case StressMessageType.task:
            testCase = msg.testCase;
            send(createMsg(WorkerStatus.ready, StressMessageType.status));
            Log.info("status: ready");
            break;
        case StressMessageType.start:
            Log.info("status: start");
            send(createMsg(WorkerStatus.working, StressMessageType.status));
            //c.testCase.Run();
            //c.finish();
            break;
        case StressMessageType.finish:
            Log.info("status: file finish");
            send(createMsg(WorkerStatus.fileReady, StressMessageType.status));
            break;
        case StressMessageType.stop:
            break;
        default:
            break;
        //c.finish()
    }
}

function trace(rst: RunResult) {
    send(createMsg(WorkerStatus.working, StressMessageType.runResult, rst));
}

function createMsg(status: WorkerStatus, type: StressMessageType, runResult: RunResult = null, cpuNum: number = 0): StressMessage {
    return { status, type, runResult, cpuNum };
}