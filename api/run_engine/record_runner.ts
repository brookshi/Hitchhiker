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
        return RecordRunner.handleRes(res.response, res.err, record, serverRes, elapsed, needPipe);
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

    static handleRes(res: request.RequestResponse, err: Error, record: Record, pipeRes: ServerResponse, elapsed: number, needPipe?: boolean): RunResult {

        const testRst = !err && record.test ? TestRunner.test(res, record.test, elapsed) : {};
        const pRes: Partial<request.RequestResponse> = res || {};
        const finalRes: RunResult = {
            host: pRes.request ? pRes.request.host : new URL(record.url).hostname,
            error: err,
            body: pRes.body,
            tests: testRst,
            elapsed: elapsed,
            headers: pRes.headers,
            cookies: pRes.headers ? pRes.headers['set-cookie'] : [],
            status: pRes.statusCode,
            statusMessage: pRes.statusMessage
        };
        if (needPipe) {
            const headers = pRes.headers;
            headers['content-length'] = JSON.stringify(finalRes).length;
            pipeRes.writeHead(pRes.statusCode, pRes.statusMessage, headers);
        }

        return finalRes;
    }
}