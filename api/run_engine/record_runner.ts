import { Record } from '../models/record';
import { RequestOptionAdapter } from "./request_option_adapter";
import * as request from "request";
import { ServerResponse } from "http";
import { TestRunner } from "./test_runner";
import * as _ from "lodash";
import { RunResult } from "../interfaces/dto_run_result";

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
        const testRst = TestRunner.test(res, record.test, elapsed);
        const finalRes: RunResult = {
            body: res.body,
            tests: testRst,
            elapsed: elapsed,
            headers: res.headers,
            cookies: res.headers['Set-Cookie'],
            status: res.statusCode,
            statusMessage: res.statusMessage
        };
        const headers = res.headers;

        headers['content-length'] = JSON.stringify(finalRes).length;
        pipeRes.writeHead(res.statusCode, res.statusMessage, headers);

        return finalRes;
    }
}