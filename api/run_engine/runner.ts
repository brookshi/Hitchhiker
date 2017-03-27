import { Record } from '../models/record';
import { RequestOptionAdapter } from "./request_option_adapter";
import * as request from "request";
import { ServerResponse } from "http";

export class Runner {
    static async runRecord(envId: string, record: Record, pipeRes?: ServerResponse): Promise<{ err: any, response: request.RequestResponse, body: any }> {
        const option = await RequestOptionAdapter.fromRecord(envId, record);
        return await Runner.request(option, pipeRes);
    }

    static request(option: request.Options, pipeRes?: ServerResponse): Promise<{ err: any, response: request.RequestResponse, body: any }> {
        return new Promise<{ err: any, response: request.RequestResponse, body: any }>((resolve, reject) => {
            request(option, (err, res, body) => {
                resolve({ err: err, response: res, body: body });
            }).pipe(pipeRes);
        });
    }
}