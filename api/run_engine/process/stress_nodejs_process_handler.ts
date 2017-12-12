import { BaseProcessHandler } from './base_process_handler';
import { ChildProcess } from 'child_process';
import { StressMessageType } from '../../common/stress_type';

export class StressNodejsProcessHandler extends BaseProcessHandler {

    handleMessage(msg: any) {
        if (msg === 'ready') {
            process.send({ type: StressMessageType.start });
        }
    }

    afterProcessCreated() {
    }
}