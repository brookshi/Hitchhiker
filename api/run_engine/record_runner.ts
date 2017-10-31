import { Record } from '../models/record';
import { RequestOptionAdapter } from './request_option_adapter';
import * as request from 'request';
import { ServerResponse } from 'http';
import { TestRunner } from './test_runner';
import * as _ from 'lodash';
import { RunResult } from '../interfaces/dto_run_result';
import { StringUtil } from '../utils/string_util';
import { ProjectService } from '../services/project_service';

export class RecordRunner {

    private static RequestTimeout = 30 * 60 * 1000;

    static async runRecords(rs: Record[], environmentId: string, needOrder: boolean = false, orderRecordIds: string = '', applyCookies?: boolean, trace?: (msg: string) => void): Promise<Array<RunResult | _.Dictionary<RunResult>>> {
        const runResults: Array<RunResult | _.Dictionary<RunResult>> = [];
        if (needOrder && orderRecordIds) {
            const cookies: _.Dictionary<string> = {};
            let variables: any = {};
            let records = _.sortBy(rs, 'name');
            const recordDict = _.keyBy(records, 'id');
            const orderRecords = orderRecordIds.split(';').filter(r => recordDict[r]).map(r => recordDict[r]);
            records = _.unionBy(orderRecords, records, 'id');
            for (let record of records) {
                const paramArr = StringUtil.parseParameters(record.parameters, record.parameterType);
                if (paramArr.length === 0) {
                    runResults.push(await RecordRunner.runRecordWithVW(record, environmentId, variables, cookies, '', trace));
                } else {
                    // TODO: sync or async ?
                    for (let param of paramArr) {
                        record = RecordRunner.applyReqParameterToRecord(record, param);
                        const runResult = await RecordRunner.runRecordWithVW(record, environmentId, variables, cookies, param, trace);
                        runResults.push({ [runResult.param]: runResult });
                    }
                }
            }
        } else {
            await Promise.all(rs.map(async r => {
                const paramArr = StringUtil.parseParameters(r.parameters, r.parameterType);
                let result;
                if (paramArr.length === 0) {
                    result = await RecordRunner.runRecord(environmentId, r);
                    runResults.push(result);
                } else {
                    await Promise.all(paramArr.map(async p => {
                        const record = RecordRunner.applyReqParameterToRecord(r, p);
                        result = await RecordRunner.runRecord(environmentId, record);
                        result.param = StringUtil.toString(p);
                        runResults.push({ [result.param]: result });
                    }));
                }
                if (trace) {
                    trace(JSON.stringify(result));
                }
            }));
        }
        return runResults;
    }

    static async runRecordWithVW(record: Record, environmentId: string, variables: any, cookies: _.Dictionary<string>, param: any, trace?: (msg: string) => void) {

        record = RecordRunner.applyCookies(record, cookies);
        record = RecordRunner.applyLocalVariables(record, variables);

        const result = await RecordRunner.runRecord(environmentId, record);

        variables = RecordRunner.storeVariables(result, variables);
        RecordRunner.storeCookies(result, cookies);

        result.param = StringUtil.toString(param);
        if (trace) {
            trace(JSON.stringify(result));
        }

        return result;
    }

    static storeCookies(result: RunResult, cookies: _.Dictionary<string>) {
        if (result.cookies) {
            result.cookies.forEach(c => {
                const keyPair = StringUtil.readCookie(c);
                cookies[keyPair.key] = keyPair.value;
            });
        }
    }

    static applyCookies(record: Record, cookies: _.Dictionary<string>): Record {
        if (_.keys(cookies).length === 0) {
            return record;
        }
        let localCookies = cookies;
        let headers = [...record.headers || []];
        const cookieHeader = headers.find(h => h.isActive && (h.key || '').toLowerCase() === 'cookie');

        let recordCookies: _.Dictionary<string> = {};
        if (cookieHeader) {
            recordCookies = StringUtil.readCookies(cookieHeader.value || '');
            if (_.values(recordCookies).some(c => c === 'nocookie')) {
                localCookies = {};
            }
        }
        const allCookies = { ...localCookies, ...recordCookies };
        _.remove(headers, h => (h.key || '').toLowerCase() === 'cookie');

        headers = Object.keys(allCookies).length > 0 ? [
            ...headers, {
                id: '',
                sort: 0,
                record,
                key: 'Cookie',
                value: _.values(allCookies).join('; '),
                isActive: true,
                isFav: false
            }
        ] : headers;
        return { ...record, headers };
    }

    static storeVariables(result: RunResult, variables: any): any {
        if (!!result.variables) {
            return { ...variables, ...result.variables };
        }
        return variables;
    }

    static applyLocalVariables(record: Record, variables: any): Record {
        if (_.keys(variables).length === 0) {
            return record;
        }
        const headers = [];
        for (let header of record.headers) {
            headers.push({
                ...header,
                key: RecordRunner.applyVariables(header.key, variables),
                value: RecordRunner.applyVariables(header.value, variables)
            });
        }
        return {
            ...record,
            headers,
            url: RecordRunner.applyVariables(record.url, variables),
            test: RecordRunner.applyVariables(record.test, variables),
            body: RecordRunner.applyVariables(record.body, variables),
            prescript: RecordRunner.applyVariables(record.prescript, variables),
        };
    }

    static applyReqParameterToRecord(record: Record, parameter: any): Record {
        const headers = [];
        for (let header of record.headers || []) {
            headers.push({
                ...header,
                key: RecordRunner.applyVariables(header.key, parameter),
                value: RecordRunner.applyVariables(header.value, parameter)
            });
        }
        return {
            ...record,
            url: RecordRunner.applyVariables(record.url, parameter),
            headers,
            body: RecordRunner.applyVariables(record.body, parameter),
            test: RecordRunner.applyVariables(record.test, parameter),
            prescript: RecordRunner.applyVariables(record.prescript, parameter)
        };
    }

    static applyVariables = (content: string | undefined, variables: any) => {
        if (!variables || !content) {
            return content;
        }
        let newContent = content;
        _.keys(variables).forEach(k => {
            newContent = newContent.replace(new RegExp(`{{${k}}}`, 'g'), variables[k] == null ? '' : variables[k]);
        });
        return newContent;
    }

    static async runRecord(envId: string, record: Record, userId?: string, serverRes?: ServerResponse, needPipe?: boolean): Promise<RunResult> {
        const option = await RequestOptionAdapter.fromRecord(envId, record, userId);
        const start = process.hrtime();
        const res = await RecordRunner.request(option, serverRes, needPipe);
        const elapsed = process.hrtime(start)[0] * 1000 + _.toInteger(process.hrtime(start)[1] / 1000000);
        const globalFunc = await ProjectService.getGlobalFunc(record.collection.id);
        return RecordRunner.handleRes(res.response, res.err, record, globalFunc, envId, elapsed, serverRes, needPipe);
    }

    static request(option: request.Options, serverRes?: ServerResponse, needPipe?: boolean): Promise<{ err: any, response: request.RequestResponse, body: any }> {
        return new Promise<{ err: any, response: request.RequestResponse, body: any }>((resolve, reject) => {
            const req = request({ ...option, timeout: RecordRunner.RequestTimeout }, (err, res, body) => {
                resolve({ err: err, response: res, body: body });
            });
            if (needPipe) {
                req.pipe(serverRes);
            }
        });
    }

    static handleRes(res: request.RequestResponse, err: Error, record: Record, globalFunc: string, envId: string, elapsed: number, pipeRes?: ServerResponse, needPipe?: boolean): RunResult {
        const testRst = !err && record.test ? TestRunner.test(res, globalFunc, record.test, elapsed) : { tests: {}, variables: {}, export: {} };
        const pRes: Partial<request.RequestResponse> = res || {};
        const finalRes: RunResult = {
            id: record.id,
            envId,
            host: pRes.request ? pRes.request.host : StringUtil.getHostFromUrl(record.url),
            error: err ? { message: err.message, stack: err.stack } : undefined,
            body: pRes.body,
            tests: testRst.tests,
            variables: testRst.variables,
            export: testRst.export,
            elapsed: elapsed,
            headers: pRes.headers || [],
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