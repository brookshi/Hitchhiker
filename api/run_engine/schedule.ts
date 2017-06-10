import { Record } from '../models/record';
import { Setting } from "../utils/setting";

process.on('message', data => {
    process.send('echo');
});

startSchedules();

function startSchedules() {
    setInterval(() => {
        console.log('task');
    }, Setting.instance.batch.checkDuration * 1000);
}

function getRecords(scheduelId: string): Record[] {
    return [];
}