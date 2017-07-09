import 'reflect-metadata';
import { Setting } from '../utils/setting';
import { Log } from '../utils/log';
import { ScheduleRunner } from './schedule_runner';

Log.init();

process.on('message', (msg) => {
    if (msg === 'start') {
        startSchedules();
    }
});

function startSchedules() {
    new ScheduleRunner().run();
    setInterval(() => {
        new ScheduleRunner().run();
    }, Setting.instance.schedule.duration * 1000);
}