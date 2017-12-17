import { DtoSchedule } from '../interfaces/dto_schedule';
import { Schedule } from '../models/schedule';
import { StringUtil } from '../utils/string_util';
import { User } from '../models/user';
import { ConnectionManager } from './connection_manager';
import { Message } from '../common/message';
import { ResObject } from '../common/res_object';
import { UserCollectionService } from './user_collection_service';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { ScheduleRecordService } from './schedule_record_service';
import { ScheduleRecord } from '../models/schedule_record';
import { Period, TimerType } from '../interfaces/period';
import { DateUtil } from '../utils/date_util';
import { Log } from '../utils/log';

export class ScheduleService {

    static fromDto(dtoSchedule: DtoSchedule): Schedule {
        const schedule = new Schedule();
        schedule.collectionId = dtoSchedule.collectionId;
        if (dtoSchedule.environmentId) {
            schedule.environmentId = dtoSchedule.environmentId;
        }
        schedule.needCompare = dtoSchedule.needCompare;
        schedule.compareEnvironmentId = dtoSchedule.compareEnvironmentId;
        schedule.emails = dtoSchedule.emails;
        schedule.hour = dtoSchedule.hour;
        schedule.id = dtoSchedule.id || StringUtil.generateUID();
        schedule.name = dtoSchedule.name;
        schedule.needOrder = dtoSchedule.needOrder;
        schedule.notification = dtoSchedule.notification;
        schedule.period = dtoSchedule.period;
        schedule.timer = dtoSchedule.timer;
        schedule.recordsOrder = dtoSchedule.recordsOrder;
        schedule.suspend = dtoSchedule.suspend;
        return schedule;
    }

    static toDto(schedule: Schedule): DtoSchedule {
        return <DtoSchedule>{
            ...schedule,
            scheduleRecords: schedule.scheduleRecords ? schedule.scheduleRecords.map(s => ScheduleRecordService.toDto(s)) : [],
            ownerId: schedule.ownerId
        };
    }

    static async save(schedule: Schedule): Promise<any> {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(Schedule).save(schedule);
    }

    static async getById(id: string): Promise<Schedule> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(Schedule)
            .createQueryBuilder('schedule')
            .where('schedule.id=:id', { id: id })
            .getOne();
    }

    static async getByUserId(userId: string): Promise<Schedule[]> {
        const collections = await UserCollectionService.getUserProjectCollections(userId);
        if (!collections || collections.length === 0) {
            return [];
        }
        const collectionIds = collections.map(c => c.id);
        const connection = await ConnectionManager.getInstance();

        const parameters: ObjectLiteral = {};
        const whereStrings = collectionIds.map((id, index) => {
            parameters[`id_${index}`] = id;
            return `collectionId=:id_${index}`;
        });
        const whereStr = whereStrings.length > 1 ? '(' + whereStrings.join(' OR ') + ')' : whereStrings[0];

        var schedules = await connection.getRepository(Schedule)
            .createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.scheduleRecords', 'record')
            .where(whereStr, parameters)
            .getMany();

        schedules.forEach(s => {
            if (s.lastRunDate) {
                s.lastRunDate = new Date(s.lastRunDate + ' UTC');
            }
            s.scheduleRecords.forEach(sr => {
                if (new Date(sr.runDate).getFullYear() < 2000) {
                    sr.runDate = sr.createDate;
                } else {
                    sr.runDate = new Date(sr.runDate + ' UTC');
                }
            });
        });
        return schedules;
    }

    static async getAllNeedRun(): Promise<Schedule[]> {
        const connection = await ConnectionManager.getInstance();
        return await connection.getRepository(Schedule).find({ 'suspend': false });
    }

    static async createNew(dtoSchedule: DtoSchedule, owner: User): Promise<ResObject> {
        const schedule = ScheduleService.fromDto(dtoSchedule);
        schedule.ownerId = owner.id;
        await ScheduleService.save(schedule);
        return { message: Message.scheduleCreateSuccess, success: true };
    }

    static async update(dtoSchedule: DtoSchedule): Promise<ResObject> {
        const schedule = ScheduleService.fromDto(dtoSchedule);
        await ScheduleService.save(schedule);
        return { message: Message.scheduleUpdateSuccess, success: true };
    }

    static async delete(id: string): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();
        await connection.transaction(async manager => {
            await manager.createQueryBuilder(ScheduleRecord, 'scheduleRecord')
                .where('scheduleId=:id', { id })
                .delete()
                .execute();
            await manager.createQueryBuilder(Schedule, 'schedule')
                .where('id=:id', { id })
                .delete()
                .execute();
        });
        await connection.getRepository(Schedule)
            .createQueryBuilder('schedule')
            .where('id=:id', { id })
            .delete()
            .execute();
        return { success: true, message: Message.scheduleDeleteSuccess };
    }

    static checkScheduleNeedRun(schedule: Schedule): boolean {
        const now = new Date();
        if (schedule.timer === TimerType.Day) {
            const isRunFinish = schedule.lastRunDate && new Date(schedule.lastRunDate + ' UTC').toDateString() === new Date().toDateString();
            if (isRunFinish) {
                return false;
            }
            const UTCPeriod = schedule.hour >= 0 ? schedule.period : schedule.period - 1;
            const UTCDay = UTCPeriod === 1 ? 6 : UTCPeriod - 2;
            const isPeriodRight = schedule.period === 1 || UTCDay === now.getUTCDay();
            const scheduleHour = schedule.hour < 0 ? 24 + schedule.hour : schedule.hour;
            return isPeriodRight && scheduleHour === now.getUTCHours();
        } else if (schedule.timer === TimerType.Hour) {
            return !schedule.lastRunDate || DateUtil.diff(schedule.lastRunDate, DateUtil.getUTCDate(), 'h', 3000) >= schedule.hour;
        } else if (schedule.timer === TimerType.Minute) {
            const diff = DateUtil.diff(schedule.lastRunDate, DateUtil.getUTCDate(), 'm', 3000);
            return !schedule.lastRunDate || diff >= schedule.hour;
        }
        return false;
    }
}