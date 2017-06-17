import { DtoSchedule } from "../interfaces/dto_schedule";
import { Schedule } from "../models/schedule";
import { StringUtil } from "../utils/string_util";
import { User } from "../models/user";
import { ConnectionManager } from "./connection_manager";
import { Message } from "../common/message";
import { ResObject } from "../common/res_object";
import { UserCollectionService } from "./user_collection_service";
import { ObjectLiteral } from "typeorm/common/ObjectLiteral";
import { ScheduleRecordService } from "./schedule_record_service";

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
        schedule.recordsOrder = dtoSchedule.recordsOrder;
        schedule.suspend = dtoSchedule.suspend;
        //schedule.ScheduleRecords = dtoSchedule.ScheduleRecords;
        return schedule;
    }

    static toDto(schedule: Schedule): DtoSchedule {
        return {
            ...schedule,
            scheduleRecords: schedule.scheduleRecords ? schedule.scheduleRecords.map(s => ScheduleRecordService.toDto(s)) : [],
            ownerId: schedule.ownerId
        };
    }

    static async save(schedule: Schedule): Promise<any> {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(Schedule).persist(schedule);
    }

    static async getById(id: string): Promise<Schedule> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(Schedule)
            .createQueryBuilder("schedule")
            .where('schedule.id=:id', { id: id })
            .getOne();
    }

    static async getByUserId(userId: string): Promise<Schedule[]> {
        const collections = await UserCollectionService.getUserTeamCollections(userId);
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
        const whereStr = whereStrings.length > 1 ? "(" + whereStrings.join(" OR ") + ")" : whereStrings[0];

        return await connection.getRepository(Schedule)
            .createQueryBuilder("schedule")
            .leftJoinAndSelect('schedule.scheduleRecords', 'record')
            .where(whereStr, parameters)
            .getMany();
    }

    static async getAllNeedRun(): Promise<Schedule[]> {
        const connection = await ConnectionManager.getInstance();
        return await connection.getRepository(Schedule).find({ 'suspend': 0 });
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
        await connection.getRepository(Schedule)
            .createQueryBuilder('schedule')
            .where('id=:id', { id })
            .delete()
            .execute();
        return { success: true, message: Message.scheduleDeleteSuccess };
    }

    static checkScheduleNeedRun(schedule: Schedule): boolean {
        const isRunFinish = new Date(schedule.lastRunDate + ' UTC').toDateString() === new Date().toDateString();
        if (isRunFinish) {
            return false;
        }
        const now = new Date();
        const UTCPeriod = schedule.hour >= 0 ? schedule.period : schedule.period - 1;
        const UTCDay = UTCPeriod === 1 ? 6 : UTCPeriod - 2;
        const isPeriodRight = schedule.period === 1 || UTCDay === now.getUTCDay();
        return isPeriodRight && schedule.hour === now.getUTCHours();
    }
}