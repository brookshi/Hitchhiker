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

    static async get(scheduleId: string, page: number): Promise<[ScheduleRecord[], number]> {
        const connection = await ConnectionManager.getInstance();
        return await connection.getRepository(ScheduleRecord)
            .createQueryBuilder('record')
            .offset(Setting.instance.schedulePageSize * page)
            .limit(Setting.instance.schedulePageSize)
            .where('record.schedule=:id', { id: scheduleId })
            .getManyAndCount();
    }

    static async clearRedundantRecords(scheduleId: string) {
        const {scheduleStoreLimit, scheduleStoreUnit } = Setting.instance;
        const connection = await ConnectionManager.getInstance();

        const query = await connection.getRepository(ScheduleRecord)
            .createQueryBuilder('record')
            .where('record.schedule=:id', { id: scheduleId })
            .orderBy('record.createDate', 'DESC');

        let records;
        if (scheduleStoreUnit === 'count') {
            records = query.limit(scheduleStoreLimit).getMany();
            if (records.length < scheduleStoreLimit) {
                return;
            }
        } else {
            const minDate = new Date().getTime() - (24 * 60 * 60 * 1000) * scheduleStoreLimit;
            records = query.where('record.createDate>:date', { date: DateUtil.getUTCDate(new Date(minDate)) });
        }

        const lastDate = DateUtil.getUTCDate(records[records.length - 1].createDate);
        await connection.getRepository(ScheduleRecord)
            .createQueryBuilder('record')
            .where('scheduleId=:id', { id: scheduleId })
            .andWhere('createDate<=:date', { date: lastDate })
            .delete()
            .execute();
    }
}