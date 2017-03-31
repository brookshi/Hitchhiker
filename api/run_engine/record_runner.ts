import { Record } from '../models/record';
import { RequestOptionAdapter } from "./request_option_adapter";
import * as request from "request";
import { ServerResponse } from "http";
import { TestRunner } from "./test_runner";
import { RunResult } from "../common/run_result";
import * as _ from "lodash";

export class RecordRunner {
    static async runRecord(envId: string, record: Record, serverRes: ServerResponse, needPipe?: boolean): Promise<RunResult> {
        const option = await RequestOptionAdapter.fromRecord(envId, record);
        const start = process.hrtime();
        const res = await RecordRunner.request(option, serverRes, needPipe);
        const elapsed = process.hrtime(start)[0] * 1000 + _.toInteger(process.hrtime(start)[1] / 1000000);
        return RecordRunner.handleRes(res.response, record, serverRes, elapsed);
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

    static handleRes(res: request.RequestResponse, record: Record, pipeRes: ServerResponse, elapsed: number): RunResult {
        const testRst = TestRunner.test(res, record.test);
        const body = { body: res.body, tests: testRst, elapsed: elapsed };
        const headers = res.headers;

        headers['content-length'] = JSON.stringify(body).length;
        pipeRes.writeHead(res.statusCode, res.statusMessage, headers);

        return body;
    }
}