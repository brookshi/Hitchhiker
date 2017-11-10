import { Record } from '../models/record';
import { RequestOptionAdapter } from './request_option_adapter';
import * as request from 'request';
import { ServerResponse } from 'http';
import { ScriptRunner } from './script_runner';
import * as _ from 'lodash';
import { RunResult } from '../interfaces/dto_run_result';
import { StringUtil } from '../utils/string_util';
import { ProjectService } from '../services/project_service';
import { UserVariableManager } from '../services/user_variable_manager';
import { ResObject } from '../common/res_object';
import { VariableService } from '../services/variable_service';
import { EnvironmentService } from '../services/environment_service';

type BatchRunResult = RunResult | _.Dictionary<RunResult>;

export class RecordRunner {

    private static RequestTimeout = 30 * 60 * 1000;

    static async runRecords(rs: Record[], environmentId: string, needOrder: boolean = false, orderRecordIds: string = '', applyCookies?: boolean, trace?: (msg: string) => void): Promise<Array<RunResult | _.Dictionary<RunResult>>> {
        const runResults: Array<RunResult | _.Dictionary<RunResult>> = [];
        const vid = StringUtil.generateUID();
        const env = await EnvironmentService.get(environmentId, false);
        const envName = env ? env.name : '';
        if (needOrder && orderRecordIds) {
            await RecordRunner.runRecordSeries(rs, orderRecordIds, environmentId, envName, vid, runResults, trace);
        } else {
            await RecordRunner.runRecordParallel(rs, environmentId, envName, vid, runResults, trace);
        }
        UserVariableManager.clearVariables(vid);
        UserVariableManager.clearCookies(vid);
        return runResults;
    }

    private static async runRecordSeries(rs: Record[], orderRecordIds: string, environmentId: string, envName: string, vid: string, runResults: BatchRunResult[], trace?: (msg: string) => void) {
        let records = _.sortBy(rs, 'name');
        const recordDict = _.keyBy(records, 'id');
        const orderRecords = orderRecordIds.split(';').map(i => i.substr(0, i.length - 2)).filter(r => recordDict[r]).map(r => recordDict[r]);
        records = _.unionBy(orderRecords, records, 'id');
        for (let record of records) {
            const paramArr = StringUtil.parseParameters(record.parameters, record.parameterType);
            if (paramArr.length === 0) {
                runResults.push(await RecordRunner.runRecordWithVW(record, environmentId, envName, undefined, vid, '', undefined, trace));
            } else {
                // TODO: sync or async ?
                for (let param of paramArr) {
                    record = RecordRunner.applyReqParameterToRecord(record, param);
                    const runResult = await RecordRunner.runRecordWithVW(record, environmentId, envName, undefined, vid, param, undefined, trace);
                    runResults.push({ [runResult.param]: runResult });
                }
            }
        }
    }

    private static async runRecordParallel(rs: Record[], environmentId: string, envName: string, vid: string, runResults: BatchRunResult[], trace?: (msg: string) => void) {
        await Promise.all(rs.map(async (r) => {
            const paramArr = StringUtil.parseParameters(r.parameters, r.parameterType);
            let result;
            if (paramArr.length === 0) {
                result = await RecordRunner.runRecordWithVW(r, environmentId, envName, undefined, vid, '');
                runResults.push(result);
            } else {
                await Promise.all(paramArr.map(async (p) => {
                    const record = RecordRunner.applyReqParameterToRecord(r, p);
                    result = await RecordRunner.runRecordWithVW(record, environmentId, envName, undefined, vid, p);
                    result.param = StringUtil.toString(p);
                    runResults.push({ [result.param]: result });
                }));
            }
            if (trace) {
                trace(JSON.stringify(result));
            }
        }));
    }

    static async runRecordFromClient(record: Record, environmentId: string, userId: string, serverRes?: ServerResponse): Promise<RunResult> {
        const env = await EnvironmentService.get(environmentId);
        return await RecordRunner.runRecordWithVW(record, environmentId, env ? env.name : '', userId, undefined, '', serverRes);
    }

    private static async runRecordWithVW(record: Record, environmentId: string, envName: string, uid: string, vid: string, param: any, serverRes?: ServerResponse, trace?: (msg: string) => void) {

        let prescriptResult = { success: true, message: '' };
        let variables: any = UserVariableManager.getVariables(uid || vid, environmentId);
        const cookies: _.Dictionary<string> = UserVariableManager.getCookies(uid || vid, environmentId);


        const start = process.hrtime();
        if (record.prescript) {
            const prescriptWithVar = await VariableService.applyVariable(environmentId, record.prescript);
            const { globalFunction, id: pid } = (await ProjectService.getProjectByCollectionId(record.collection.id)) || { globalFunction: '', id: '' };
            prescriptResult = await ScriptRunner.prerequest(pid, uid || vid, environmentId, envName, globalFunction, prescriptWithVar);
            variables = UserVariableManager.getVariables(uid || vid, environmentId);
        }

        record = RecordRunner.applyLocalVariables(record, variables);
        record = RecordRunner.applyCookies(record, cookies);

        const option = await RequestOptionAdapter.fromRecord(environmentId, record, uid);
        const result = await RecordRunner.runRecord(start, option, environmentId, envName, record, prescriptResult, uid, vid, serverRes);

        RecordRunner.storeVariables(result, variables);
        RecordRunner.storeCookies(result, cookies);

        result.param = StringUtil.toString(param);
        if (trace) {
            trace(JSON.stringify(result));
        }

        return result;
    }

    private static storeCookies(result: RunResult, cookies: _.Dictionary<string>) {
        if (result.cookies) {
            result.cookies.forEach(c => {
                const keyPair = StringUtil.readCookie(c);
                cookies[keyPair.key] = keyPair.value;
            });
        }
    }

    private static applyCookies(record: Record, cookies: _.Dictionary<string>): Record {
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

    private static storeVariables(result: RunResult, variables: any) {
        if (result.variables) {
            _.keys(result.variables).forEach(k => {
                variables[k] = result.variables[k];
            });
        }
    }

    private static applyLocalVariables(record: Record, variables: any): Record {
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

    private static applyVariables = (content: string | undefined, variables: any) => {
        if (!variables || !content) {
            return content;
        }
        let newContent = content;
        _.keys(variables).forEach(k => {
            newContent = newContent.replace(new RegExp(`{{${k}}}`, 'g'), variables[k] == null ? '' : variables[k]);
        });
        return newContent;
    }

    private static async runRecord(start: [number, number], option: request.Options, envId: string, envName: string, record: Record, prescriptResult: ResObject, userId?: string, vid?: string, serverRes?: ServerResponse, needPipe?: boolean): Promise<RunResult> {
        const res = await RecordRunner.request(option, serverRes, needPipe);
        const elapsed = process.hrtime(start)[0] * 1000 + _.toInteger(process.hrtime(start)[1] / 1000000);
        const { globalFunction, id: pid } = (await ProjectService.getProjectByCollectionId(record.collection.id)) || { globalFunction: '', id: '' };
        var rst = await RecordRunner.handleRes(res.response, res.err, record, pid, userId || vid, envId, envName, globalFunction || '', elapsed, serverRes, needPipe);
        if (!prescriptResult.success) {
            rst.tests[prescriptResult.message] = false;
        }
        return rst;
    }

    private static request(option: request.Options, serverRes?: ServerResponse, needPipe?: boolean): Promise<{ err: any, response: request.RequestResponse, body: any }> {
        return new Promise<{ err: any, response: request.RequestResponse, body: any }>((resolve, reject) => {
            const req = request({ ...option, timeout: RecordRunner.RequestTimeout }, (err, res, body) => {
                resolve({ err: err, response: res, body: body });
            });
            if (needPipe) {
                req.pipe(serverRes);
            }
        });
    }

    private static async handleRes(res: request.RequestResponse, err: Error, record: Record, pid: string, vid: string, envId: string, envName: string, globalFunc: string, elapsed: number, pipeRes?: ServerResponse, needPipe?: boolean): Promise<RunResult> {
        const testRst = !err && record.test ? (await ScriptRunner.test(pid, vid, envId, envName, res, globalFunc, record.test, elapsed)) : { tests: {}, variables: {}, export: {} };
        const pRes: Partial<request.RequestResponse> = res || {};
        const finalRes: RunResult = {
            id: record.id,
            envId,
            host: pRes.request ? pRes.request.host : StringUtil.getHostFromUrl(record.url),
            error: err ? { message: err.message, stack: err.stack } : undefined,
            body: pRes.body,
            tests: testRst.tests,
            variables: {},
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