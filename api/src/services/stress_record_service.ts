import { ConnectionManager } from './connection_manager';
import { Setting } from '../utils/setting';
import { DateUtil } from '../utils/date_util';
import { StressRecord } from '../models/stress_record';
import { DtoStressRecord } from '../interfaces/dto_stress_record';
import { StressFailedInfo } from '../models/stress_failed_info';

export class StressRecordService {

    static toDto(record: StressRecord): DtoStressRecord {
        return <DtoStressRecord>{ ...record, stressId: record.stress ? record.stress.id : '' };
    }

    static async create(record: StressRecord, info: StressFailedInfo): Promise<StressRecord> {
        const connection = await ConnectionManager.getInstance();
        const result = await connection.getRepository(StressRecord).save(record);
        await connection.getRepository(StressFailedInfo).save({ id: result.id, info: JSON.stringify(info) });
        return result;
    }

    static async clearRedundantRecords(stressId: string) {
        const maxCount = Setting.instance.stressMaxCount;
        const connection = await ConnectionManager.getInstance();

        const records = await connection.getRepository(StressRecord)
            .createQueryBuilder('record')
            .limit(maxCount)
            .where('record.stress=:id', { id: stressId })
            .orderBy('record.createDate', 'DESC')
            .getMany();
        if (records.length < maxCount) {
            return;
        }

        const lastDate = DateUtil.getUTCDate(records[maxCount - 1].createDate);
        await connection.getRepository(StressRecord)
            .createQueryBuilder('record')
            .where('stressId=:id', { id: stressId })
            .andWhere('createDate<=:date', { date: lastDate })
            .delete()
            .execute();
    }
}