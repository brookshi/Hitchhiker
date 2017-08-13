import { Record } from '../models/record';
import { Options } from 'request';
import { VariableService } from '../services/variable_service';
import { RecordService } from '../services/record_service';
import { ProjectService } from '../services/project_service';

export class RequestOptionAdapter {
    static async fromRecord(envId: string, record: Record, userId?: string): Promise<Options> {
        record = await VariableService.applyVariableForRecord(envId, record);
        await RequestOptionAdapter.applyLocalhost(record, userId);
        return {
            url: record.url,
            method: record.method,
            headers: RecordService.formatHeaders(record),
            body: record.body
        };
    }

    static async applyLocalhost(record: Record, userId?: string): Promise<any> {
        const regex = /^(http:\/\/|https:\/\/)?localhost(:|\/)/g;
        if (!regex.test(record.url)) {
            return;
        }
        const localhost = await ProjectService.getLocalhost(userId, record.collection.id);
        record.url = record.url.replace(regex, `$1${localhost}$2`);
        return;
    }
}