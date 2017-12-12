import { BaseProcessHandler } from './base_process_handler';
import { ChildProcess } from 'child_process';

export class ScheduleProcessHandler extends BaseProcessHandler {

    handleMessage(data: any) {
    }

    afterProcessCreated() {
        this.process.send('start');
    }
}