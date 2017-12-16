import { Record, RecordEx } from '../models/record';
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
import { HeaderService } from '../services/header_service';
import { CollectionService } from '../services/collection_service';
import { Duration } from '../interfaces/dto_stress_setting';
import { RecordService } from '../services/record_service';

type BatchRunResult = RunResult | _.Dictionary<RunResult>;

export class RecordRunner {

    static async runRecords(rs: Record[], environmentId: string, needOrder: boolean = false, orderRecordIds: string = '', applyCookies?: boolean, trace?: (msg: string) => void): Promise<Array<RunResult | _.Dictionary<RunResult>>> {
        const recordExs = await RecordService.prepareRecordsForRun(rs, environmentId, needOrder ? orderRecordIds : undefined, trace);
        return await RecordRunner.runRecordExs(recordExs, needOrder);
    }

    static async runRecordExs(rs: RecordEx[], needOrder: boolean): Promise<Array<RunResult | _.Dictionary<RunResult>>> {
        const runResults: Array<RunResult | _.Dictionary<RunResult>> = [];
        if (rs.length === 0) {
            return runResults;
        }
        const vid = rs[0].vid;
        if (needOrder) {
            await RecordRunner.runRecordSeries(rs, runResults);
        } else {
            await RecordRunner.runRecordParallel(rs, runResults);
        }
        UserVariableManager.clearVariables(vid);
        UserVariableManager.clearCookies(vid);
        return runResults;
    }

    private static async runRecordSeries(records: RecordEx[], runResults: BatchRunResult[]) {
        for (let record of records) {
            const paramArr = StringUtil.parseParameters(record.parameters, record.parameterType);
            if (paramArr.length === 0) {
                runResults.push(await RecordRunner.runRecordWithVW(record));
            } else {
                // TODO: sync or async ?
                for (let param of paramArr) {
                    record = RecordRunner.applyReqParameterToRecord(record, param) as RecordEx;
                    const runResult = await RecordRunner.runRecordWithVW(record);
                    runResults.push({ [runResult.param]: runResult });
                }
            }
        }
    }

    private static async runRecordParallel(rs: RecordEx[], runResults: BatchRunResult[]) {
        await Promise.all(rs.map(async (r) => {
            const paramArr = StringUtil.parseParameters(r.parameters, r.parameterType);
            let result;
            if (paramArr.length === 0) {
                result = await RecordRunner.runRecordWithVW(r);
                runResults.push(result);
            } else {
                await Promise.all(paramArr.map(async (p) => {
                    const record = RecordRunner.applyReqParameterToRecord(r, p) as RecordEx;
                    result = await RecordRunner.runRecordWithVW(record);
                    result.param = StringUtil.toString(p);
                    runResults.push({ [result.param]: result });
                }));
            }
        }));
    }

    static async runRecordFromClient(record: Record, envId: string, uid: string, serverRes?: ServerResponse): Promise<RunResult> {
        const env = await EnvironmentService.get(envId);
        if (record.collection && record.collection.id) {
            record.collection = await CollectionService.getById(record.collection.id);
        }
        return await RecordRunner.runRecordWithVW({ ...record, envId, envName: env.name, uid, vid: '', param: '', serverRes });
    }

    private static async runRecordWithVW(record: RecordEx) {
        let prescriptResult: ResObject = { success: true, message: '' };
        const { uid, vid, envId, envName, serverRes, param, trace } = record;
        const cookies: _.Dictionary<string> = UserVariableManager.getCookies(uid || vid, envId);

        if (record.prescript) {
            const data = await RecordRunner.runPreScript(record);
            prescriptResult = data.prescriptResult || prescriptResult;
            record = data.record;
        }

        let variables: any = UserVariableManager.getVariables(uid || vid, envId);

        record = RecordRunner.applyLocalVariables(record, variables);
        record = RecordRunner.applyCookies(record, cookies);

        const result = await RecordRunner.runRecord(record, prescriptResult);

        RecordRunner.storeVariables(result, variables);
        RecordRunner.storeCookies(result, cookies);

        result.param = StringUtil.toString(param);
        if (trace) {
            trace(JSON.stringify(result));
        }

        return result;
    }

    private static async runPreScript(record: RecordEx): Promise<{ prescriptResult: ResObject, record: RecordEx }> {
        const { envId, envName, prescript, uid, vid, pid } = record;
        const prescriptResult = await ScriptRunner.prerequest(record);
        if (prescriptResult.success) {
            record = { ...record, ...prescriptResult.result, headers: [] };
            _.keys(prescriptResult.result.headers).forEach(k => {
                record.headers.push(HeaderService.fromDto({
                    isActive: true,
                    key: k,
                    value: prescriptResult.result.headers[k]
                }));
            });
        }
        return { prescriptResult, record };
    }

    private static storeCookies(result: RunResult, cookies: _.Dictionary<string>) {
        if (result.cookies) {
            result.cookies.forEach(c => {
                const keyPair = StringUtil.readCookie(c);
                cookies[keyPair.key] = keyPair.value;
            });
        }
    }

    private static applyCookies(record: RecordEx, cookies: _.Dictionary<string>): RecordEx {
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

    private static applyLocalVariables(record: RecordEx, variables: any): RecordEx {
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

    private static async runRecord(record: RecordEx, prescriptResult: ResObject, needPipe?: boolean): Promise<RunResult> {
        const option = await RequestOptionAdapter.fromRecord(record);
        const res = await RecordRunner.request(option, record.serverRes, needPipe);
        const rst = await RecordRunner.handleRes(res.response, res.err, record, needPipe);
        if (!prescriptResult.success) {
            rst.tests[prescriptResult.message] = false;
        }
        return rst;
    }

    private static request(option: request.Options, serverRes?: ServerResponse, needPipe?: boolean): Promise<{ err: any, response: request.RequestResponse, body: any }> {
        return new Promise<{ err: any, response: request.RequestResponse, body: any }>((resolve, reject) => {
            const req = request(option, (err, res, body) => {
                resolve({ err: err, response: res, body: body });
            });
            if (needPipe) {
                req.pipe(serverRes);
            }
        });
    }

    private static async handleRes(res: request.RequestResponse, err: Error, record: RecordEx, needPipe?: boolean): Promise<RunResult> {
        const { envId, serverRes } = record;
        const testRst = !err && record.test ? (await ScriptRunner.test(record, res)) : { tests: {}, variables: {}, export: {} };
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
            elapsed: pRes.timingPhases ? pRes.timingPhases.total >> 0 : 0,
            duration: RecordRunner.generateDuration(pRes),
            headers: pRes.headers || {},
            cookies: pRes.headers ? pRes.headers['set-cookie'] : [],
            status: pRes.statusCode,
            statusMessage: pRes.statusMessage
        };
        if (needPipe) {
            const headers = pRes.headers;
            headers['content-length'] = JSON.stringify(finalRes).length + '';
            serverRes.writeHead(pRes.statusCode, pRes.statusMessage, headers);
        }

        return finalRes;
    }

    private static generateDuration(pRes: Partial<request.RequestResponse>): Duration {
        const timingPhases = pRes.timingPhases || { wait: 0, dns: 0, total: 0 };
        const { wait, dns, total } = timingPhases;
        return {
            connect: wait,
            dns,
            request: total - wait - dns
        };
    }
}