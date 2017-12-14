import 'reflect-metadata';
import { TestCase, StressRequest } from '../interfaces/dto_stress_setting';
import { Log } from '../utils/log';
import { RecordRunner } from './record_runner';
import { StressMessageType } from '../common/stress_type';
import * as _ from 'lodash';

Log.init();

Log.info(`worker ${process.pid} start`);

let testCase: TestCase;

process.on('uncaughtException', (err) => {
    Log.error(err);
    process.send('error');
});

process.on('message', (msg: StressRequest) => {
    if (msg.type === StressMessageType.start) {
        Log.info(`worker ${process.pid}: run`);
        run();
    } else if (msg.type === StressMessageType.task) {
        Log.info(`worker ${process.pid}: receive case`);
        testCase = msg.testCase;
        process.send('ready');
    }
});

async function run() {
    if (testCase.concurrencyCount >= 1) {
        await Promise.all(_.times(testCase.concurrencyCount, () =>
            RecordRunner.runRecords(testCase.records, testCase.envId, true, 'placeholder', true, msg => process.send(msg))));
    }
    Log.info(`worker ${process.pid}: finish`);
    process.send('finish');
}