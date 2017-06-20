import { ScheduleRecord } from "../models/schedule_record";
import { DtoScheduleRecord } from "../interfaces/dto_schedule_record";
import { ConnectionManager } from "./connection_manager";

export class ScheduleRecordService {

    static toDto(record: ScheduleRecord): DtoScheduleRecord {
        return { ...record, scheduleId: record.schedule ? record.schedule.id : '' };
    }

    static async create(record: ScheduleRecord) {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(ScheduleRecord).persist(record);
    }
}