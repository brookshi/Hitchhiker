import * as childProcess from 'child_process';
import { Log } from '../utils/log';
import * as _ from 'lodash';
import { StressSetting } from '../interfaces/dto_stress_setting';
import * as WS from 'ws';

export class ChildProcessManager {

    static instance = new ChildProcessManager();

    private constructor() { }

    private childProcesses: _.Dictionary<childProcess.ChildProcess> = {};

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

            if (msg.complete) {
                if (this.retryTimes === 0) {
                    return;
                } else {
                    this.retryTimes--;
                    Log.info(`${moduleName} complete, time: ${this.retryTimes}!`);
                }
            }
        });

        process.on('exit', () => {
            if (this.retryTimes === this.limit) {
                Log.error(`${moduleName} process exit ${this.limit} times, stop it.`);
                return;
            }
            Log.warn(`${moduleName} exit!`);
            this.createChildProcess(this.childModules[moduleName]);
        });

        process.send('start');
    }

    sendStressTask(id: string, socket: WS, collectionId: string, stressSetting: StressSetting) {
        Log.info('send stress test task.');
        this.childProcesses.stress.send('task', { id, socket, collectionId, stressSetting });
    }
}