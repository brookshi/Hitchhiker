import 'reflect-metadata';
import { Setting } from '../../utils/setting';
import { Log } from '../../utils/log';
import { ScheduleRunner } from '../schedule_runner';
import { ProjectDataService } from '../../services/project_data_service';

Log.init();

process.on('uncaughtException', (err) => {
    Log.error(err);
});

process.on('message', (msg) => {
    if (msg === 'start') {
        startScheduleProcess();
    } else if (msg === 'reload_project_data') {
        Log.info('schedule: reload libs');
        ProjectDataService.instance.reload();
    }
});

function startScheduleProcess() {
    new ScheduleRunner().run();
    setInterval(() => {
        new ScheduleRunner().run();
    }, Setting.instance.scheduleDuration * 1000);
}