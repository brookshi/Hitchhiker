import * as childProcess from 'child_process';
import { Log } from '../../utils/log';
import * as _ from 'lodash';
import * as path from 'path';
import { TestCase, StressResponse, StressRequest } from '../../interfaces/dto_stress_setting';
import * as WS from 'ws';
import { StressMessageType } from '../../common/stress_type';
import { BaseProcessHandler } from './base_process_handler';
import { ScheduleProcessHandler } from './schedule_process_handler';
import { StressProcessHandler } from './stress_process_handler';
import { StressNodejsProcessHandler } from './stress_nodejs_process_handler';

interface ProcessInfo {

    count: number;

    entry: string;

    handlerCtor: { new(): BaseProcessHandler };
}

export class ChildProcessManager {

    static default = new ChildProcessManager();

    private constructor() { }

    private limit = 10;

    private retryTimes = 0;

    private autoRetry = true;

    private processHandlerMapping: _.Dictionary<BaseProcessHandler | BaseProcessHandler[]> = {};

    private processConfigs: _.Dictionary<ProcessInfo> = {
        ['schedule']: { entry: `${__dirname}/schedule_process.js`, count: 1, handlerCtor: ScheduleProcessHandler },
        ['stress']: { entry: `${__dirname}/stress_process.js`, count: 1, handlerCtor: StressProcessHandler },
        ['stress_nodejs']: { entry: path.join(__dirname, 'stress_nodejs_process.js'), count: 1, handlerCtor: StressNodejsProcessHandler }
    };

    static create(key: string, info: ProcessInfo) {
        const manager = new ChildProcessManager();
        Log.info(`create process manager for ${info.entry}`);
        manager.processConfigs = {
            [key]: info
        };
        manager.autoRetry = false;
        return manager;
    }

    init() {
        this.processHandlerMapping = {};
        _.keys(this.processConfigs).forEach(c => _.times(this.processConfigs[c].count, n => this.createChildProcess(c)));
        process.on('exit', () => _.values(this.processHandlerMapping).forEach(p => {
            if (p instanceof Array) {
                p.forEach(cp => cp.process.kill());
            } else {
                p.process.kill();
            }
        }));
    }

    createChildProcess(moduleName: string) {
        const { handlerCtor, count, entry } = this.processConfigs[moduleName];
        const handler = new handlerCtor();
        if (count === 1) {
            this.processHandlerMapping[moduleName] = handler;
        } else {
            this.processHandlerMapping[moduleName] = this.processHandlerMapping[moduleName] || [];
            (this.processHandlerMapping[moduleName] as BaseProcessHandler[]).push(handler);
        }
        const process = childProcess.fork(entry, [], { silent: false, execArgv: [] });
        handler.process = process;

        process.on('message', msg => {
            handler.handleMessage(msg);
        });

        process.on('exit', (code, signal) => {
            if (!this.autoRetry) {
                Log.info(`${moduleName} process exit - code:${code}, signal:${signal}.`);
                return;
            }
            if (this.retryTimes === this.limit) {
                Log.error(`${moduleName} process exit ${this.limit} times, stop it.`);
                return;
            }
            Log.warn(`${moduleName} exit - code:${code}, signal:${signal}!`);
            this.retryTimes++;
            this.createChildProcess(moduleName);
        });

        handler.afterProcessCreated();
    }

    closeAll() {
        _.values(this.processHandlerMapping).forEach(p => {
            if (p instanceof Array) {
                p.forEach(cp => cp.process.kill());
            } else {
                p.process.kill();
            }
        });
    }

    getHandler(type: 'schedule' | 'stress' | 'stress_nodejs' | 'stress_nodejs_runner') {
        return this.processHandlerMapping[type];
    }
}