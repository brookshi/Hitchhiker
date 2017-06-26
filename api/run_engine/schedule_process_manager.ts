import * as childProcess from 'child_process';
import { Log } from "../utils/log";

export class ScheduleProcessManager {

    static instance = new ScheduleProcessManager();

    private scheduleProcess: childProcess.ChildProcess;

    private limit = 10;

    private retryTimes = 0;

    init() {
        this.createScheduleProcess();
        process.on('exit', this.scheduleProcess.kill);
    }

    createScheduleProcess() {
        this.scheduleProcess = childProcess.fork(`${__dirname}/schedule_process.js`, [], { silent: false, execArgv: [] });

        this.scheduleProcess.on('message', msg => {

            if (msg.completeSchedules) {
                if (this.retryTimes === 0) {
                    return;
                } else {
                    this.retryTimes--;
                    Log.info(`complete schedule, time: ${this.retryTimes}!`);
                }
            }
        });

        this.scheduleProcess.on('exit', () => {
            if (this.retryTimes === this.limit) {
                Log.error(`schedule process exit ${this.limit} times, stop it.`);
                return;
            }
            Log.warn(`schedule exit!`);
            this.createScheduleProcess();
        });

        this.scheduleProcess.send('start');
    }
}