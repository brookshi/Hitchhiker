import { ScheduleRecord } from '../models/schedule_record';
import { DtoScheduleRecord } from '../interfaces/dto_schedule_record';
import { ConnectionManager } from './connection_manager';
import { Setting } from '../utils/setting';
import { DateUtil } from '../utils/date_util';

export class ScheduleRecordService {

    static toDto(record: ScheduleRecord): DtoScheduleRecord {
        return <DtoScheduleRecord>{ ...record, scheduleId: record.schedule ? record.schedule.id : '' };
    }

    static async create(record: ScheduleRecord): Promise<ScheduleRecord> {
        const connection = await ConnectionManager.getInstance();
        return await connection.getRepository(ScheduleRecord).save(record);
    }

    static async clearRedundantRecords(scheduleId: string) {
        const maxCount = Setting.instance.scheduleMaxCount;
        const connection = await ConnectionManager.getInstance();

        const records = await connection.getRepository(ScheduleRecord)
            .createQueryBuilder('record')
            .limit(maxCount)
            .where('record.schedule=:id', { id: scheduleId })
            .orderBy('record.createDate', 'DESC')
            .getMany();
        if (records.length < maxCount) {
            return;
        }

        const lastDate = DateUtil.getUTCDate(records[maxCount - 1].createDate);
        await connection.getRepository(ScheduleRecord)
            .createQueryBuilder('record')
            .where('scheduleId=:id', { id: scheduleId })
            .andWhere('createDate<=:date', { date: lastDate })
            .delete()
            .execute();
    }
}