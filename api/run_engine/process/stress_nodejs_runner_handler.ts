import { BaseProcessHandler } from './base_process_handler';
import { ChildProcess } from 'child_process';
import { StressMessageType } from '../../common/stress_type';

export class StressNodejsRunnerHandler extends BaseProcessHandler {

    isFinish: boolean;

    handleMessage(msg: any) {
        if (msg === 'ready') {
            process.send({ type: StressMessageType.start });
        } else if (msg === 'finish' || msg === 'error') {
            this.isFinish = true;
        }

        if (this.call) {
            this.call(msg);
        }
    }

    afterProcessCreated() {
    }
}