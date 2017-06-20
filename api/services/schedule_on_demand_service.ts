import * as WS from 'ws';
import { ScheduleService } from "./schedule_service";
import { runSchedule } from "../run_engine/schedule";
import { WebSocketHandler } from "./base/web_socket_handler";

export class ScheduleOnDemandService extends WebSocketHandler {

    onReceive(data: string) {
        console.log(`receive data: ${data}`);
        if (!data) {
            this.close('invalid schedule id');
        }

        this.run(data).then(() => this.close());
    }

    onClose() {
        console.log('client close');
        this.close();
    }

    async run(id: string): Promise<any> {
        const schedule = await ScheduleService.getById(id);
        if (!schedule) {
            this.close('schedule id does not exist');
            return;
        }

        await runSchedule(schedule, null, false, this.send);
    }
}