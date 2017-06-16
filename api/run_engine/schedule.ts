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
import { DateUtil } from "../utils/date_util";

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
    await Promise.all(schedules.map(schedule => runSchedule(schedule, recordDict[schedule.collectionId], true)));
}

export async function runSchedule(schedule: Schedule, records?: Record[], isScheduleRun?: boolean): Promise<any> {
    if (!records) {
        records = await RecordService.getByCollectionIds([schedule.collectionId])[schedule.collectionId];
    }
    if (records.length === 0) {
        console.log(`record's count is 0`);
        return;
    }
    console.log(`run schedule ${schedule.name}`);
    const needCompare = schedule.needCompare && schedule.compareEnvironmentId;
    const originRunResults = await RecordRunner.runRecords(records, schedule.environmentId, schedule.needOrder, schedule.recordsOrder);
    const compareRunResults = needCompare ? await RecordRunner.runRecords(records, schedule.compareEnvironmentId, schedule.needOrder, schedule.recordsOrder) : [];
    await storeRunResult(originRunResults, compareRunResults, schedule, isScheduleRun);

    console.log(`run schedule finish`);
    schedule.lastRunDate = DateUtil.getUTCDate();
    await ScheduleService.save(schedule);
    // TODO: notification
}

async function storeRunResult(originRunResults: RunResult[], compareRunResults: RunResult[], schedule: Schedule, isScheduleRun?: boolean) {
    const scheduleRecord = new ScheduleRecord();
    const totalRunResults = { ...originRunResults, ...compareRunResults };
    scheduleRecord.success = totalRunResults.filter(r => isSuccess(r)).length === originRunResults.length;
    scheduleRecord.schedule = schedule;
    scheduleRecord.result = { origin: originRunResults, compare: compareRunResults };
    scheduleRecord.isScheduleRun = isScheduleRun;
    scheduleRecord.duration = totalRunResults.map(r => r.elapsed).reduce((p, a) => p + a);

    await ScheduleRecordService.create(scheduleRecord);
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