import { Record } from '../models/record';
import { RequestOptionAdapter } from "./request_option_adapter";
import * as request from "request";
import { ServerResponse } from "http";
import { TestRunner } from "./test_runner";
import { RunResult } from "../common/run_result";

export class RecordRunner {
    static async runRecord(envId: string, record: Record, serverRes: ServerResponse, needPipe?: boolean): Promise<RunResult> {
        const option = await RequestOptionAdapter.fromRecord(envId, record);
        const res = await RecordRunner.request(option, serverRes, needPipe);
        return RecordRunner.handleRes(res.response, record, serverRes);
    }

    static request(option: request.Options, serverRes: ServerResponse, needPipe?: boolean): Promise<{ err: any, response: request.RequestResponse, body: any }> {
        return new Promise<{ err: any, response: request.RequestResponse, body: any }>((resolve, reject) => {
            const req = request(option, (err, res, body) => {
                resolve({ err: err, response: res, body: body });
            });
            if (needPipe) {
                req.pipe(serverRes);
            }
        });
    }

    static handleRes(res: request.RequestResponse, record: Record, pipeRes: ServerResponse): RunResult {
        const testRst = TestRunner.test(res, record.test);
        const body = { body: res.body, tests: testRst };
        const headers = res.headers;

        headers['content-length'] = JSON.stringify(body).length;
        pipeRes.writeHead(res.statusCode, res.statusMessage, headers);

        return body;
    }
}