import { DtoSchedule } from "../interfaces/dto_schedule";
import { Schedule } from "../models/schedule";
import { Collection } from "../models/collection";
import { Environment } from "../models/environment";
import { StringUtil } from "../utils/string_util";
import { User } from "../models/user";
import { ConnectionManager } from "./connection_manager";
import { Message } from "../common/message";
import { ResObject } from "../common/res_object";

export class ScheduleService {

    static fromDTO(dtoSchedule: DtoSchedule): Schedule {
        const schedule = new Schedule();
        schedule.collection = new Collection();
        schedule.collection.id = dtoSchedule.collectionId;
        if (dtoSchedule.environmentId) {
            schedule.environment = new Environment();
            schedule.environment.id = dtoSchedule.environmentId;
        }
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

    static async save(schedule: Schedule): Promise<any> {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(Schedule).persist(schedule);
    }

    static async getById(id: string, needOwner: boolean = false, needCollection: boolean = false, needEnv: boolean = false, needRecords: boolean = false): Promise<Schedule> {
        const connection = await ConnectionManager.getInstance();
        let rep = connection.getRepository(Schedule).createQueryBuilder("schedule");
        if (needOwner) {
            rep = rep.leftJoinAndSelect('schedule.owner', 'owner');
        }
        if (needCollection) {
            rep = rep.leftJoinAndSelect('schedule.collection', 'collection');
        }
        if (needEnv) {
            rep = rep.leftJoinAndSelect('schedule.environment', 'environment');
        }
        if (needRecords) {
            rep = rep.leftJoinAndSelect('schedule.scheduleRecords', 'records');
        }
        return await rep.where('schedule.id=:id', { id: id }).getOne();
    }

    static async createNew(dtoSchedule: DtoSchedule, owner: User): Promise<ResObject> {
        const schedule = ScheduleService.fromDTO(dtoSchedule);
        schedule.owner = owner;
        await ScheduleService.save(schedule);
        return { message: Message.scheduleCreateSuccess, success: true };
    }

    static async update(dtoSchedule: DtoSchedule): Promise<ResObject> {
        const schedule = ScheduleService.fromDTO(dtoSchedule);
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
}