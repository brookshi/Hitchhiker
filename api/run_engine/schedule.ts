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

process.on('message', data => {
    process.send('echo');
});

startSchedules();

function startSchedules() {
    setInterval(() => {
        run();
    }, Setting.instance.batch.checkDuration * 1000);
}

async function run() {
    const schedules = await getAllSchedules();
    if (schedules.length === 0) {
        return;
    }
    const recordDict = await RecordService.getByCollectionIds(_.sortedUniq(schedules.map(s => s.collectionId)));
    await Promise.all(schedules.map(schedule => runSchedule(schedule, recordDict[schedule.collectionId])));
}

async function runSchedule(schedule: Schedule, records: Record[]): Promise<any> {
    const runResults = await RecordRunner.runRecords(records, schedule.environmentId, schedule.needOrder, schedule.recordsOrder);
    const scheduleRecord = new ScheduleRecord();
    scheduleRecord.success = runResults.map(r => isSuccess(r)).length === runResults.length;
    scheduleRecord.schedule = schedule;
    scheduleRecord.result = JSON.stringify(runResults);
    scheduleRecord.isScheduleRun = true;
    scheduleRecord.duration = runResults.map(r => r.elapsed).reduce((p, a) => p + a);
    await ScheduleRecordService.create(scheduleRecord);
}

async function getAllSchedules(): Promise<Schedule[]> {
    const schedules = await ScheduleService.getAllNeedRun();
    return schedules.filter(s => ScheduleService.checkScheduleNeedRun(s));
}

function isSuccess(runResult: RunResult): boolean {
    return !runResult.error && _.values(runResult.tests).reduce((p, a) => p && a);
}

function generateDescription(runResults: RunResult[]): string {
    const successCount = runResults.map(r => isSuccess(r)).length;
    return '';
}