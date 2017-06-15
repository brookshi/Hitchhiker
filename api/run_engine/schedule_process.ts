import * as childProcess from 'child_process';

export class ScheduleProcess {

    static scheduleProcess;

    static init() {
        ScheduleProcess.scheduleProcess = childProcess.fork(`${__dirname}/schedule.js`, [], { silent: false, execArgv: [] });
        ScheduleProcess.scheduleProcess.on('message', msg => {

        });
    }
}