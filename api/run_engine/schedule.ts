import "reflect-metadata";
import { Setting } from "../utils/setting";
import { Schedule } from "../models/schedule";
import { Record } from "../models/record";
import { ScheduleService } from "../services/schedule_service";
import { RecordService } from "../services/record_service";
import { RecordRunner } from "./record_runner";
import * as _ from "lodash";
import { RunResult } from "../interfaces/dto_run_result";
import { ScheduleRecord } from "../models/schedule_record";
import { ScheduleRecordService } from "../services/schedule_record_service";
import { ConnectionManager } from "../services/connection_manager";

// process.on('message', data => {
//     process.send('echo');
// });
console.log('schedule start');
startSchedules();

function startSchedules() {
    //run();
    setInterval(() => {
        // console.log('schedule run');
        // run();
    }, Setting.instance.batch.checkDuration * 1000);
}

export async function run() {
    console.log('get all schedule');
    await ConnectionManager.init();
    const schedules = await getAllSchedules();
    if (schedules.length === 0) {
        console.log('schedules length is 0');
        return;
    }
    console.log('get records by collection ids');
    const recordDict = await RecordService.getByCollectionIds(_.sortedUniq(schedules.map(s => s.collectionId)));
    await Promise.all(schedules.map(schedule => runSchedule(schedule, recordDict[schedule.collectionId])));
}

async function runSchedule(schedule: Schedule, records: Record[]): Promise<any> {
    if (records.length === 0) {
        console.log(`record's count is 0`);
        return;
    }
    console.log(`run schedule ${schedule.name}`);
    const runResults = await RecordRunner.runRecords(records, schedule.environmentId, schedule.needOrder, schedule.recordsOrder);
    const scheduleRecord = new ScheduleRecord();
    scheduleRecord.success = runResults.filter(r => isSuccess(r)).length === runResults.length;
    scheduleRecord.schedule = schedule;
    scheduleRecord.result = runResults;
    scheduleRecord.isScheduleRun = true;
    scheduleRecord.duration = runResults.map(r => r.elapsed).reduce((p, a) => p + a);
    console.log(`run schedule finish, ${scheduleRecord.success}`);
    await ScheduleRecordService.create(scheduleRecord);
    // TODO: udpate schedule last run date
}

async function getAllSchedules(): Promise<Schedule[]> {
    const schedules = await ScheduleService.getAllNeedRun();
    console.log(`root schedules length is ${schedules.length}`);
    return schedules.filter(s => ScheduleService.checkScheduleNeedRun(s));
}

function isSuccess(runResult: RunResult): boolean {
    const testValues = _.values(runResult.tests);
    return !runResult.error && (testValues.length === 0 || testValues.reduce((p, a) => p && a));
}