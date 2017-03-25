import { Record } from '../models/record';
import { RequestOptionAdapter } from "./request_option_adapter";
import * as request from "request";

export class Runner {
    static async runRecord(envId: string, record: Record) {
        const option = await RequestOptionAdapter.fromRecord(envId, record);
        await request(option);
    }

    static request(option: request.Options): Promise<{ err: any, response: request.RequestResponse, body: any }> {
        return new Promise<{ err: any, response: request.RequestResponse, body: any }>((resolve, reject) => {
            request(option, (err, res, body) => {
                // if (err) {
                //     reject(err);
                // } else {
                resolve({ err: err, response: res, body: body });
                // }
            });
        });

    }
}