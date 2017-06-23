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

console.log('schedule start');
startSchedules();

function startSchedules() {
    run();
    setInterval(() => {
        console.log('schedule run');
        run();
    }, Setting.instance.schedule.checkDuration * 1000);
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
    const recordDict = await RecordService.getByCollectionIds(_.sortedUniq(schedules.map(s => s.collectionId)), true);
    await Promise.all(schedules.map(schedule => runSchedule(schedule, recordDict[schedule.collectionId], true)));
}

export async function runSchedule(schedule: Schedule, records?: Record[], isScheduleRun?: boolean, trace?: (msg: string) => void): Promise<any> {
    if (!records) {
        const collectionRecords = await RecordService.getByCollectionIds([schedule.collectionId], true);
        records = collectionRecords[schedule.collectionId];
    }
    if (!records || records.length === 0) {
        console.log(`record's count is 0`);
        return;
    }
    console.log(`run schedule ${schedule.name}`);
    const needCompare = schedule.needCompare && schedule.compareEnvironmentId;
    const originRunResults = await RecordRunner.runRecords(records, schedule.environmentId, schedule.needOrder, schedule.recordsOrder, trace);
    const compareRunResults = needCompare ? await RecordRunner.runRecords(records, schedule.compareEnvironmentId, schedule.needOrder, schedule.recordsOrder, trace) : [];
    const record = await storeRunResult(originRunResults, compareRunResults, schedule, isScheduleRun);

    console.log(`run schedule finish`);
    schedule.lastRunDate = new Date();
    await ScheduleService.save(schedule);

    if (trace) {
        trace(JSON.stringify({ isResult: true, ...record }));
    }
    // TODO: notification
}

async function storeRunResult(originRunResults: RunResult[], compareRunResults: RunResult[], schedule: Schedule, isScheduleRun?: boolean): Promise<ScheduleRecord> {
    const scheduleRecord = new ScheduleRecord();
    const totalRunResults = [...originRunResults, ...compareRunResults];
    scheduleRecord.success = totalRunResults.filter(r => isSuccess(r)).length === originRunResults.length && compare(originRunResults, compareRunResults);
    scheduleRecord.schedule = schedule;
    scheduleRecord.result = { origin: originRunResults, compare: compareRunResults };
    scheduleRecord.isScheduleRun = isScheduleRun;
    scheduleRecord.duration = totalRunResults.map(r => r.elapsed).reduce((p, a) => p + a);

    console.log('clear redundant records');
    await ScheduleRecordService.clearRedundantRecords(schedule.id);
    console.log('create new record');
    return await ScheduleRecordService.create(scheduleRecord);
}

function compare(originRunResults: RunResult[], compareRunResults: RunResult[]) {
    if (compareRunResults.length === 0) {
        return true;
    }
    if (originRunResults.length !== compareRunResults.length) {
        return false;
    }
    for (let i = 0; i < originRunResults.length; i++) {
        if (originRunResults[i].body !== compareRunResults[i].body) {
            return false;
        }
    }
    return true;
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