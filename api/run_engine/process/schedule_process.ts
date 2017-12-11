import 'reflect-metadata';
import { Setting } from '../../utils/setting';
import { Log } from '../../utils/log';
import { ScheduleRunner } from '../schedule_runner';

Log.init();

process.on('message', (msg) => {
    if (msg === 'start') {
        startScheduleProcess();
    }
});

function startScheduleProcess() {
    new ScheduleRunner().run();
    setInterval(() => {
        new ScheduleRunner().run();
    }, Setting.instance.scheduleDuration * 1000);
}