import 'reflect-metadata';
import { Schedule } from '../models/schedule';
import { Record } from '../models/record';
import { ScheduleService } from '../services/schedule_service';
import { RecordService } from '../services/record_service';
import { RecordRunner } from './record_runner';
import * as _ from 'lodash';
import { RunResult } from '../interfaces/dto_run_result';
import { ScheduleRecord } from '../models/schedule_record';
import { ScheduleRecordService } from '../services/schedule_record_service';
import { ConnectionManager } from '../services/connection_manager';
import { EnvironmentService } from '../services/environment_service';
import { Environment } from '../models/environment';
import { NotificationMode } from '../interfaces/notification_mode';
import { UserService } from '../services/user_service';
import { CollectionService } from '../services/collection_service';
import { ProjectService } from '../services/project_service';
import { MailService } from '../services/mail_service';
import { Log } from '../utils/log';
import { DateUtil } from '../utils/date_util';

export class ScheduleRunner {

    async run() {
        Log.info('schedule start.');
        Log.info('get all schedule.');
        await ConnectionManager.init();
        const schedules = await this.getAllSchedules();
        if (schedules.length === 0) {
            Log.info('schedules length is 0.');
            return;
        }
        Log.info('get records by collection ids.');
        const recordDict = await RecordService.getByCollectionIds(_.sortedUniq(schedules.map(s => s.collectionId)), true);
        await Promise.all(schedules.map(schedule => this.runSchedule(schedule, recordDict[schedule.collectionId], true)));
    }

    async runSchedule(schedule: Schedule, records?: Record[], isScheduleRun?: boolean, trace?: (msg: string) => void): Promise<any> {
        if (!records) {
            const collectionRecords = await RecordService.getByCollectionIds([schedule.collectionId], true);
            records = collectionRecords[schedule.collectionId];
        }
        if (!records || records.length === 0) {
            Log.info(`record count is 0`);
            return;
        }
        Log.info(`run schedule ${schedule.name}`);
        const needCompare = schedule.needCompare && schedule.compareEnvironmentId;
        const originRunResults = await RecordRunner.runRecords(records, schedule.environmentId, schedule.needOrder, schedule.recordsOrder, true, trace);
        const compareRunResults = needCompare ? await RecordRunner.runRecords(records, schedule.compareEnvironmentId, schedule.needOrder, schedule.recordsOrder, true, trace) : [];
        const record = await this.storeRunResult(originRunResults, compareRunResults, schedule, isScheduleRun);

        schedule.lastRunDate = DateUtil.getUTCDate();
        await ScheduleService.save(schedule);

        if (trace) {
            trace(JSON.stringify({ isResult: true, ...record }));
        }

        Log.info('send mails');
        const mails = await this.getMailsByMode(schedule);
        if (!mails || mails.length === 0) {
            Log.info('no valid email');
            return;
        }
        await MailService.scheduleMail(mails, await this.getRecordInfoForMail(record, records, schedule.environmentId, schedule.compareEnvironmentId));

        Log.info(`run schedule finish`);
    }

    private async getMailsByMode(schedule: Schedule): Promise<string[]> {
        if (schedule.notification === NotificationMode.me) {
            const user = await UserService.getUserById(schedule.ownerId);
            return user ? [user.email] : [];
        } else if (schedule.notification === NotificationMode.project) {
            const collection = await CollectionService.getById(schedule.collectionId);
            if (!collection) {
                return [];
            }
            const project = await ProjectService.getProject(collection.project.id, false, false, true, false);
            if (!project) {
                return [];
            }
            return project.members.map(m => m.email);
        } else if (schedule.notification === NotificationMode.custom) {
            return schedule.emails.split(';');
        }
        return [];
    }

    private async getRecordInfoForMail(record: ScheduleRecord, records: Record[], originEnvId: string, compareEnvId: string) {
        const envNames = _.keyBy(await EnvironmentService.getEnvironments([originEnvId, compareEnvId]), 'id');
        const recordDict = _.keyBy(records, 'id');
        return {
            ...record,
            scheduleName: record.schedule.name,
            runResults: [...this.getRunResultForMail(record.result.origin, originEnvId, envNames, recordDict),
            ...this.getRunResultForMail(record.result.compare, compareEnvId, envNames, recordDict)]
        };
    }

    private getRunResultForMail(runResults: RunResult[], envId: string, envNames: _.Dictionary<Environment>, recordDict: _.Dictionary<Record>) {
        const unknownRecord = 'unknown';
        const unknownEnv = 'No Environment';
        return runResults.map(r => ({ ...r, isSuccess: this.isSuccess(r), envName: envNames[envId] ? envNames[envId].name : unknownEnv, recordName: recordDict[r.id] ? recordDict[r.id].name : unknownRecord, duration: r.elapsed }));
    }

    private async storeRunResult(originRunResults: RunResult[], compareRunResults: RunResult[], schedule: Schedule, isScheduleRun?: boolean): Promise<ScheduleRecord> {
        const scheduleRecord = new ScheduleRecord();
        const totalRunResults = [...originRunResults, ...compareRunResults];

        scheduleRecord.success = totalRunResults.every(r => this.isSuccess(r)) && this.compare(originRunResults, compareRunResults, schedule);
        scheduleRecord.schedule = schedule;
        scheduleRecord.result = { origin: originRunResults, compare: compareRunResults };
        scheduleRecord.isScheduleRun = isScheduleRun;
        scheduleRecord.duration = totalRunResults.map(r => r.elapsed).reduce((p, a) => p + a);

        Log.info('clear redundant records');
        await ScheduleRecordService.clearRedundantRecords(schedule.id);
        Log.info('create new record');
        return await ScheduleRecordService.create(scheduleRecord);
    }

    private compare(originRunResults: RunResult[], compareRunResults: RunResult[], schedule: Schedule) {
        if (compareRunResults.length === 0) {
            return true;
        }
        if (originRunResults.length !== compareRunResults.length) {
            return false;
        }

        const notNeedMatchIds = schedule.recordsOrder ? schedule.recordsOrder.split(';').filter(r => r.endsWith(':0')).map(r => r.substr(0, r.length - 2)) : [];
        for (let i = 0; i < originRunResults.length; i++) {
            if (!notNeedMatchIds[originRunResults[i].id] && originRunResults[i].body !== compareRunResults[i].body) {
                return false;
            }
        }
        return true;
    }

    private async getAllSchedules(): Promise<Schedule[]> {
        const schedules = await ScheduleService.getAllNeedRun();
        Log.info(`root schedules length is ${schedules.length}`);
        return schedules.filter(s => ScheduleService.checkScheduleNeedRun(s));
    }

    private isSuccess(runResult: RunResult): boolean {
        const testValues = _.values(runResult.tests);
        return !runResult.error && (testValues.length === 0 || testValues.reduce((p, a) => p && a));
    }
}
