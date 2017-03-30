import { Record } from '../models/record';
import { RequestOptionAdapter } from "./request_option_adapter";
import * as request from "request";
import { ServerResponse } from "http";

export class RecordRunner {
    static async runRecord(envId: string, record: Record, pipeRes?: ServerResponse): Promise<{ err: any, response: request.RequestResponse, body: any }> {
        const option = await RequestOptionAdapter.fromRecord(envId, record);
        return await RecordRunner.request(option, pipeRes);
    }

    static request(option: request.Options, pipeRes?: ServerResponse): Promise<{ err: any, response: request.RequestResponse, body: any }> {
        return new Promise<{ err: any, response: request.RequestResponse, body: any }>((resolve, reject) => {
            const req = request(option, (err, res, body) => {
                resolve({ err: err, response: res, body: body });
            });
            if (pipeRes) {
                req.pipe(pipeRes);
            }
        });
    }
}