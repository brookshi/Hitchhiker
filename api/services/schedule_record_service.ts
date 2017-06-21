import { ScheduleRecord } from "../models/schedule_record";
import { DtoScheduleRecord } from "../interfaces/dto_schedule_record";
import { ConnectionManager } from "./connection_manager";
import { Setting } from "../utils/setting";
import { FindOptions } from "typeorm";

export class ScheduleRecordService {

    static toDto(record: ScheduleRecord): DtoScheduleRecord {
        return { ...record, scheduleId: record.schedule ? record.schedule.id : '' };
    }

    static async create(record: ScheduleRecord) {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(ScheduleRecord).persist(record);
    }

    static async clearByMaxCount(scheduleId: string) {
        const maxCount = Setting.instance.schedule.storeMaxCount;
        const connection = await ConnectionManager.getInstance();
        const findOption: FindOptions = {
            alias: 'scheduleRecord',
            orderBy: { createDate: 'DESC' },
            maxResults: maxCount - 1,
            whereConditions: { schedule: scheduleId }
        };
        const records = await connection.getRepository(ScheduleRecord).find(findOption);
        if (records.length < maxCount - 1) {
            return;
        }

        const lastDate = records[maxCount - 2].createDate;
        //await connection.entityManager.remove(.getRepository(ScheduleRecord).remove()
    }
}