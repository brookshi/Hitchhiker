import * as childProcess from 'child_process';
import { Log } from '../utils/log';
import * as _ from 'lodash';
import { TestCase, StressResponse, StressRequest } from '../interfaces/dto_stress_setting';
import * as WS from 'ws';
import { StressMessageType } from '../common/stress_type';

export class ChildProcessManager {

    static instance = new ChildProcessManager();

    private constructor() { }

    private childProcesses: _.Dictionary<childProcess.ChildProcess> = {};

    private stressHandlers: _.Dictionary<(data: StressResponse) => void> = {};

    private limit = 10;

    private retryTimes = 0;

    private childModules: _.Dictionary<string> = {
        ['schedule']: `${__dirname}/schedule_process.js`,
        ['stress']: `${__dirname}/stress_process.js`
    };

    init() {
        _.keys(this.childModules).forEach(c => this.createChildProcess(c));
        process.on('exit', () => _.values(this.childProcesses).forEach(p => p.kill()));
    }

    createChildProcess(moduleName: string) {
        const process = childProcess.fork(this.childModules[moduleName], [], { silent: false, execArgv: [] });
        this.childProcesses[moduleName] = process;

        process.on('message', msg => {

            if (moduleName === 'stress') {
                if (this.stressHandlers[msg.id]) {
                    this.stressHandlers[msg.id](msg.data);
                }
            }
        });

        process.on('exit', () => {
            if (this.retryTimes === this.limit) {
                Log.error(`${moduleName} process exit ${this.limit} times, stop it.`);
                return;
            }
            Log.warn(`${moduleName} exit!`);
            this.retryTimes++;
            this.createChildProcess(moduleName);
        });

        moduleName === 'stress' ? process.send({ type: StressMessageType.start }) : process.send('start');
    }

    initStressUser(id: string, dataHandler: (data: StressResponse) => void) {
        this.stressHandlers[id] = dataHandler;
        this.childProcesses.stress.send({ type: StressMessageType.init, id });
    }

    closeStressUser(id: string) {
        Reflect.deleteProperty(this.stressHandlers, id);
        this.childProcesses.stress.send({ type: StressMessageType.close, id });
    }

    sendStressTask(request: StressRequest) {
        Log.info('send stress test task.');
        this.childProcesses.stress.send(request);
    }

    stopStressTask(id: string) {
        Log.info('stop stress test task.');
        this.childProcesses.stress.send({ type: StressMessageType.stop, id });
    }
}