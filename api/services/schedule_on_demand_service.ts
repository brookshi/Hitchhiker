import * as WS from 'ws';
import { ScheduleService } from './schedule_service';
import { ScheduleRunner } from '../run_engine/schedule_runner';
import { WebSocketHandler } from './base/web_socket_handler';
import { Log } from '../utils/log';
import { Message } from '../common/message';

export class ScheduleOnDemandService extends WebSocketHandler {

    onReceive(data: string) {
        Log.info(`receive data: ${data}`);
        if (!data) {
            this.close('invalid schedule id');
        }

        this.run(data).then(() => this.close());
    }

    onClose() {
        Log.info('client close');
        this.close();
    }

    async run(id: string): Promise<any> {
        const schedule = await ScheduleService.getById(id);
        if (!schedule) {
            this.close(Message.scheduleNotExist);
            return;
        }

        await new ScheduleRunner().runSchedule(schedule, null, false, data => this.send(data));
    }
}