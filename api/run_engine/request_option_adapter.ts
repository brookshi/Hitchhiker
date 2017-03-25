import { Record } from '../models/record';
import { Options } from 'request';
import { VariableService } from "../services/variableService";


export class RequestOptionAdapter {
    static async fromRecord(envId: string, record: Record): Promise<Options> {
        record = await VariableService.applyVariableForRecord(envId, record);
        return {
            url: record.url,
            baseUrl: record.url,
            method: record.method,
            headers: record.formatHeaders,
            body: record.body
        };
    }
}