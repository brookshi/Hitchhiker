import 'reflect-metadata';
import { TestCase, StressRequest } from '../../interfaces/dto_stress_setting';
import { Log } from '../../utils/log';
import { RecordRunner } from '../record_runner';
import { StressMessageType } from '../../common/stress_type';
import * as _ from 'lodash';

Log.init();

Log.info(`worker ${process.pid} start`);

let testCase: TestCase;
let isFinish: boolean;

process.on('uncaughtException', (err) => {
    Log.error(err);
    process.send('error');
});

process.on('message', (msg: StressRequest) => {
    if (msg.type === StressMessageType.start) {
        Log.info(`worker ${process.pid}: run`);
        isFinish = false;
        run();
    } else if (msg.type === StressMessageType.task) {
        Log.info(`worker ${process.pid}: receive case`);
        testCase = msg.testCase;
        testCase.records.forEach(r => r.trace = d => process.send(d));
        process.send('ready');
    } else if (msg.type === StressMessageType.stop) {
        Log.info(`worker ${process.pid}: stop`);
        isFinish = true;
    }
});

async function run() {
    if (testCase.concurrencyCount >= 1) {
        await Promise.all(_.times(testCase.concurrencyCount, runRecordRepeat));
    }
    Log.info(`worker ${process.pid}: finish`);
    process.send('finish');
    isFinish = true;
}

async function runRecordRepeat() {
    for (let i = 0; i < testCase.repeat; i++) {
        if (isFinish) {
            break;
        }
        await RecordRunner.runRecordExs(testCase.records, true, () => isFinish);
    }
}