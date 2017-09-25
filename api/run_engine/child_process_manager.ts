import * as childProcess from 'child_process';
import { Log } from '../utils/log';
import * as _ from 'lodash';

export class ChildProcessManager {

    static instance = new ChildProcessManager();

    private childProcesses: _.Dictionary<childProcess.ChildProcess> = {};

    private limit = 10;

    private retryTimes = 0;

    private childModules = [
        { name: 'schedule', module: `${__dirname}/schedule_process.js` },
        { name: 'stress', module: `${__dirname}/stress_process.js` }
    ];

    init() {
        this.childModules.forEach(c => this.createChildProcess(c));
        process.on('exit', () => _.values(this.childProcesses).forEach(p => p.kill()));
    }

    createChildProcess(childModule: { name: string, module: string }) {
        const process = childProcess.fork(childModule.module, [], { silent: false, execArgv: [] });
        this.childProcesses[childModule.name] = process;

        process.on('message', msg => {

            if (msg.complete) {
                if (this.retryTimes === 0) {
                    return;
                } else {
                    this.retryTimes--;
                    Log.info(`${childModule.name} complete, time: ${this.retryTimes}!`);
                }
            }
        });

        process.on('exit', () => {
            if (this.retryTimes === this.limit) {
                Log.error(`${childModule.name} process exit ${this.limit} times, stop it.`);
                return;
            }
            Log.warn(`${childModule.name} exit!`);
            this.createChildProcess(childModule);
        });

        process.send('start');
    }
}