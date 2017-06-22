import { ScheduleRecord } from "../models/schedule_record";
import { DtoScheduleRecord } from "../interfaces/dto_schedule_record";
import { ConnectionManager } from "./connection_manager";
import { Setting } from "../utils/setting";
import { FindManyOptions } from "typeorm";
import { DeepPartial } from "typeorm/common/DeepPartial";

export class ScheduleRecordService {

    static toDto(record: ScheduleRecord): DtoScheduleRecord {
        return { ...record, scheduleId: record.schedule ? record.schedule.id : '' };
    }

    static async create(record: ScheduleRecord): Promise<ScheduleRecord> {
        const connection = await ConnectionManager.getInstance();
        return await connection.getRepository(ScheduleRecord).persist(record);
    }

    static async clearByMaxCount(scheduleId: string) {
        const maxCount = Setting.instance.schedule.storeMaxCount;
        const connection = await ConnectionManager.getInstance();
        const findOption: FindManyOptions<DeepPartial<ScheduleRecord>> = {
            order: { createDate: 'DESC' },
            take: maxCount - 1,
            where: { schedule: { id: scheduleId } }
        };
        const records = await connection.getRepository(ScheduleRecord).find(findOption);
        if (records.length < maxCount - 1) {
            return;
        }

        const lastDate = records[maxCount - 2].createDate;
        //await connection.entityManager.remove(.getRepository(ScheduleRecord).remove()
    }
}