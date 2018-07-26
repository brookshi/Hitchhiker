import { BaseProcessHandler } from './base_process_handler';

export class ScheduleProcessHandler extends BaseProcessHandler {

    handleMessage() { }

    afterProcessCreated() {
        this.process.send('start');
    }

    reloadLib() {
        this.process.send('reload_project_data');
    }
}