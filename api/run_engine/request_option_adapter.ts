import { Record } from '../models/record';
import { CoreOptions } from 'request';
import { VariableService } from "../services/variableService";


export class RequestOptionAdapter {
    static async fromRecord(envId: string, record: Record): Promise<CoreOptions> {
        record = await VariableService.applyVariableForRecord(envId, record);
        return {
            baseUrl: record.url,
            method: record.method,
            headers: record.formatHeaders,
            body: record.body
        };
    }
}