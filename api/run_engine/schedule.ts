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
import { EnvironmentService } from "../services/environment_service";
import { Environment } from "../models/environment";
import { NotificationMode } from "../interfaces/notification_mode";
import { UserService } from "../services/user_service";
import { CollectionService } from "../services/collection_service";
import { TeamService } from "../services/team_service";
import { MailService } from "../services/mail_service";

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
        console.log(`record count is 0`);
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

    console.log('send mails');
    const mails = await getMailsByMode(schedule);
    if (!mails || mails.length === 0) {
        console.log('no valid email');
        return;
    }
    await MailService.scheduleMail(mails, await getRecordInfoForMail(record, records, schedule.environmentId, schedule.compareEnvironmentId));
}

async function getMailsByMode(schedule: Schedule): Promise<string[]> {
    if (schedule.notification === NotificationMode.me) {
        const user = await UserService.getUserById(schedule.ownerId);
        return user ? [user.email] : [];
    } else if (schedule.notification === NotificationMode.team) {
        const collection = await CollectionService.getById(schedule.collectionId);
        if (!collection) {
            return [];
        }
        const team = await TeamService.getTeam(collection.team.id, false, false, true, false);
        if (!team) {
            return [];
        }
        return team.members.map(m => m.email);
    } else if (schedule.notification === NotificationMode.custom) {
        return schedule.emails.split(';');
    }
    return [];
}

async function getRecordInfoForMail(record: ScheduleRecord, records: Record[], originEnvId: string, compareEnvId: string) {
    const envNames = _.keyBy(await EnvironmentService.getEnvironments([originEnvId, compareEnvId]), 'id');
    const recordDict = _.keyBy(records, 'id');
    return {
        ...record,
        scheduleName: record.schedule.name,
        runResults: [...getRunResultForMail(record.result.origin, originEnvId, envNames, recordDict),
        ...getRunResultForMail(record.result.compare, compareEnvId, envNames, recordDict)]
    };
}

function getRunResultForMail(runResults: RunResult[], envId: string, envNames: _.Dictionary<Environment>, recordDict: _.Dictionary<Record>) {
    const unknownRecord = 'unknown';
    const unknownEnv = 'No Environment';
    return runResults.map(r => ({ ...r, isSuccess: isSuccess(r), envName: envNames[envId] ? envNames[envId].name : unknownEnv, recordName: recordDict[r.id] ? recordDict[r.id].name : unknownRecord, duration: r.elapsed }));
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