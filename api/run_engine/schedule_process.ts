import "reflect-metadata";
import { Setting } from "../utils/setting";
import { Log } from "../utils/log";
import { ScheduleRunner } from "./schedule_runner";

Log.init();

const scheduleRunner = new ScheduleRunner();

process.on('message', (msg) => {
    if (msg === 'start') {
        startSchedules();
    }
});

function startSchedules() {
    scheduleRunner.run();
    setInterval(() => {
        scheduleRunner.run();
    }, Setting.instance.schedule.checkDuration * 1000);
}