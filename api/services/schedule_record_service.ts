
import { ScheduleRecord } from "../models/schedule_record";
import { DtoScheduleRecord } from "../interfaces/dto_schedule_record";

export class ScheduleRecordService {

    static toDto(record: ScheduleRecord): DtoScheduleRecord {
        return { ...record, scheduleId: record.schedule.id };
    }
}