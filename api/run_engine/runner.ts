import { Record } from '../models/record';
import * as request from 'request';
import { RequestOptionAdapter } from "./request_option_adapter";

export class Runner {
    static async runRecord(envId: string, record: Record) {
        const option = await RequestOptionAdapter.fromRecord(envId, record);
        //request(option)
    }
}