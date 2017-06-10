import * as childProcess from 'child_process';

export class ScheduleProcess {

    static scheduleProcess;

    static init() {
        ScheduleProcess.scheduleProcess = childProcess.fork(`${__dirname}/batch.js`, [], { silent: false, execArgv: [] });
        ScheduleProcess.scheduleProcess.on('message', msg => {
            console.log(msg);
        });
    }
}