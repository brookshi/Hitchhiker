import { Record } from '../models/record';
import { Options } from 'request';
import { VariableService } from "../services/variable_service";
import { RecordService } from "../services/record_service";

export class RequestOptionAdapter {
    static async fromRecord(envId: string, record: Record): Promise<Options> {
        record = await VariableService.applyVariableForRecord(envId, record);
        return {
            url: record.url,
            method: record.method,
            headers: RecordService.formatHeaders(record),
            body: record.body
        };
    }
}