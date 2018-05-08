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
import { AssertRunner } from './assert_runner';
import { ValidateUtil } from '../utils/validate_util';
import { FormDataService } from '../services/form_data_service';
import { ConsoleMessage } from '../services/console_message';
import { ConsoleMsg } from '../interfaces/dto_res';

type BatchRunResult = RunResult | _.Dictionary<RunResult>;

export class RecordRunner {

    static async runRecords(rs: Record[], environmentId: string, needOrder: boolean = false, orderRecordIds: string = '', applyCookies?: boolean, trace?: (msg: string) => void): Promise<Array<RunResult | _.Dictionary<RunResult>>> {
        const recordExs = await RecordService.prepareRecordsForRun(rs, environmentId, undefined, needOrder ? orderRecordIds : undefined, trace);
        return await RecordRunner.runRecordExs(recordExs, needOrder);
    }

    static async runRecordExs(rs: RecordEx[], needOrder: boolean, checkNeedStop?: () => boolean): Promise<Array<RunResult | _.Dictionary<RunResult>>> {
        const runResults: Array<RunResult | _.Dictionary<RunResult>> = [];
        if (rs.length === 0) {
            return runResults;
        }
        const vid = rs[0].vid;
        if (needOrder) {
            await RecordRunner.runRecordSeries(rs, runResults, checkNeedStop);
        } else {
            await RecordRunner.runRecordParallel(rs, runResults);
        }
        UserVariableManager.clearVariables(vid);
        UserVariableManager.clearCookies(vid);
        return runResults;
    }

    private static async runRecordSeries(records: RecordEx[], runResults: BatchRunResult[], checkNeedStop?: () => boolean) {
        for (let record of records) {
            if (checkNeedStop && checkNeedStop()) {
                break;
            }
            const parameters = await RecordRunner.getParametersWithVariables(record);
            const paramArr = StringUtil.parseParameters(parameters, record.parameterType);
            const cm = ConsoleMessage.create(false);
            if (paramArr.length === 0) {
                runResults.push(await RecordRunner.runRecordWithVW(record, cm));
            } else {
                // TODO: sync or async ?
                for (let param of paramArr) {
                    if (checkNeedStop && checkNeedStop()) {
                        break;
                    }
                    let recordEx = RecordRunner.applyReqParameterToRecord(record, param) as RecordEx;
                    recordEx = { ...recordEx, param };
                    const runResult = await RecordRunner.runRecordWithVW(recordEx, cm);
                    runResults.push({ [runResult.param]: runResult });
                }
            }
        }
    }

    private static async runRecordParallel(rs: RecordEx[], runResults: BatchRunResult[]) {
        await Promise.all(rs.map(async (r) => {
            const parameters = await RecordRunner.getParametersWithVariables(r);
            const paramArr = StringUtil.parseParameters(parameters, r.parameterType);
            const cm = ConsoleMessage.create(false);
            let result;
            if (paramArr.length === 0) {
                result = await RecordRunner.runRecordWithVW(r, cm);
                runResults.push(result);
            } else {
                await Promise.all(paramArr.map(async (p) => {
                    let record = RecordRunner.applyReqParameterToRecord(r, p) as RecordEx;
                    record = { ...record, param: p };
                    result = await RecordRunner.runRecordWithVW(record, cm);
                    runResults.push({ [result.param]: result });
                }));
            }
        }));
    }

    static async getParametersWithVariables(record: RecordEx): Promise<string> {
        const { uid, vid, envId } = record;
        const variables: any = UserVariableManager.getVariables(uid || vid, envId);
        return await RecordRunner.applyVariables(record.parameters, variables);
    }

    static async runRecordFromClient(record: Record, envId: string, uid: string, serverRes?: ServerResponse): Promise<RunResult> {
        const cm = ConsoleMessage.create(true);
        cm.push(`Start to run [${record.name}]`);
        if (record.collection && record.collection.id) {
            record.collection = await CollectionService.getById(record.collection.id);
        }
        cm.push('Prepare request');
        const recordExs = await RecordService.prepareRecordsForRun([record], envId, cm);

        cm.push(`Request infos: \n${RecordService.generateRequestInfo(recordExs[0])}`);
        recordExs[0].serverRes = serverRes;
        recordExs[0].uid = uid;
        return await RecordRunner.runRecordWithVW(recordExs[0], cm);
    }

    private static async runRecordWithVW(record: RecordEx, cm: ConsoleMessage) {
        let prescriptResult: ResObject = { success: true, message: '' };
        const { uid, vid, envId, param, trace } = record;
        const cookies: _.Dictionary<string> = UserVariableManager.getCookies(uid || vid, envId);

        if (record.prescript) {
            cm.push('Run pre request script');
            const data = await RecordRunner.runPreScript(record);
            prescriptResult = data.prescriptResult || prescriptResult;
            record = data.record;
            if (prescriptResult.result.consoleMsgQueue) {
                cm.pushArray(prescriptResult.result.consoleMsgQueue || [], true);
            }
            if (!prescriptResult.success) {
                cm.push(`Script error: ${prescriptResult.message.toString()}`, 'error');
            }
            cm.push(`Request infos: \n${RecordService.generateRequestInfo(record)}`);
        }

        let variables: any = UserVariableManager.getVariables(uid || vid, envId);

        cm.push('Apply runtime variables and coodies');
        record = RecordRunner.applyLocalVariables(record, variables);
        record = RecordRunner.applyCookies(record, cookies);
        cm.push(`Request infos: \n${RecordService.generateRequestInfo(record)}`);

        const result = await RecordRunner.runRecord(record, prescriptResult, cm);

        cm.push('Store runtime variables and cookies');
        RecordRunner.storeVariables(result, variables);
        RecordRunner.storeCookies(result, cookies);

        result.param = StringUtil.toString(param);
        if (trace) {
            trace(JSON.stringify(result));
        }

        cm.push('Complete!');
        return result;
    }

    private static async runPreScript(record: RecordEx): Promise<{ prescriptResult: ResObject, record: RecordEx }> {
        const prescriptResult = await ScriptRunner.prerequest(record);
        const { request } = prescriptResult.result;
        if (prescriptResult.success) {
            record = { ...record, ...request, headers: RecordService.restoreKeyValue(request.headers, HeaderService.fromDto), queryStrings: [], formDatas: RecordService.restoreKeyValue(request.formDatas, FormDataService.fromDto) };
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
                description: '',
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

    private static applyVariablesToKeyValue<T extends { key: string, value: string }>(keyValues: T[], variables: any) {
        return (keyValues || []).map(kv => {
            const obj = Object.assign({}, kv);
            obj.key = RecordRunner.applyVariables(kv.key, variables);
            obj.value = RecordRunner.applyVariables(kv.value, variables);
            return obj;
        });
    }

    private static applyLocalVariables(record: RecordEx, variables: any): RecordEx {
        if (_.keys(variables).length === 0) {
            return record;
        }
        const headers = this.applyVariablesToKeyValue(record.headers, variables);
        const queryStrings = this.applyVariablesToKeyValue(record.queryStrings, variables);
        const formDatas = this.applyVariablesToKeyValue(record.formDatas, variables);
        const assertInfos = {};
        for (let key of Object.keys(record.assertInfos || {})) {
            assertInfos[key] = [];
            for (let info of record.assertInfos[key]) {
                assertInfos[key].push({
                    ...info,
                    value: RecordRunner.applyVariables(info.value, variables)
                });
            }
        }
        return {
            ...record,
            headers,
            queryStrings,
            formDatas,
            url: RecordRunner.applyVariables(record.url, variables),
            test: RecordRunner.applyVariables(record.test, variables),
            body: RecordRunner.applyVariables(record.body, variables),
            prescript: RecordRunner.applyVariables(record.prescript, variables),
            assertInfos
        };
    }

    static applyReqParameterToRecord(record: Record, parameter: any): Record {
        return {
            ...record,
            url: RecordRunner.applyVariables(record.url, parameter),
            headers: this.applyVariablesToKeyValue(record.headers, parameter),
            queryStrings: this.applyVariablesToKeyValue(record.queryStrings, parameter),
            formDatas: this.applyVariablesToKeyValue(record.formDatas, parameter),
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

    private static async runRecord(record: RecordEx, prescriptResult: ResObject, cm: ConsoleMessage, needPipe?: boolean): Promise<RunResult> {
        const option = await RequestOptionAdapter.fromRecord(record, cm);

        cm.push('Start request');
        const start = process.hrtime();
        const res = await RecordRunner.request(option, record.serverRes, needPipe);
        const elapsed = process.hrtime(start)[0] * 1000 + _.toInteger(process.hrtime(start)[1] / 1000000);
        cm.push('End request');

        const rst = await RecordRunner.handleRes(res.response, elapsed, res.err, record, cm, needPipe);

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

    private static async handleRes(res: request.RequestResponse, elapsed: number, err: Error, record: RecordEx, cm: ConsoleMessage, needPipe?: boolean): Promise<RunResult> {
        const { envId, serverRes } = record;
        cm.push('Run test script');
        const testRst = !err && record.test ? (await ScriptRunner.test(record, res)) : { tests: {}, variables: {}, export: {}, consoleMsgQueue: new Array<ConsoleMsg>(), error: undefined };
        cm.pushArray(testRst.consoleMsgQueue, true);
        if (testRst.error) {
            cm.push(`Script error: ${testRst.error}`, 'error');
        }

        if (!err && record.assertInfos && Object.keys(record.assertInfos).length > 0) {
            cm.push('Run assert script');
            AssertRunner.run(record, res, testRst.tests);
        }

        const pRes: Partial<request.RequestResponse> = res || {};
        const isImg = ValidateUtil.isResImg(pRes.headers);
        const duration = RecordRunner.generateDuration(pRes, elapsed);
        cm.push(`Performance: ${this.generateDurationInfo(duration)}`);

        cm.push('Generate response');
        const finalRes: RunResult = {
            id: record.id,
            envId,
            host: pRes.request ? pRes.request.host : StringUtil.getHostFromUrl(record.url),
            error: err ? { message: err.message, stack: err.stack } : undefined,
            body: isImg ? `data:${pRes.headers['content-type']};base64,${pRes.body.toString('base64')}` : pRes.body,
            tests: testRst.tests,
            variables: {},
            export: testRst.export,
            elapsed: pRes.timingPhases ? pRes.timingPhases.total >> 0 : elapsed,
            duration,
            headers: pRes.headers || {},
            cookies: pRes.headers ? pRes.headers['set-cookie'] : [],
            status: pRes.statusCode,
            statusMessage: pRes.statusMessage,
            consoleMsgQueue: cm.messages
        };
        if (needPipe) {
            const headers = pRes.headers;
            headers['content-length'] = JSON.stringify(finalRes).length + '';
            serverRes.writeHead(pRes.statusCode, pRes.statusMessage, headers);
        }

        return finalRes;
    }

    private static generateDuration(pRes: Partial<request.RequestResponse>, elapsed: number): Duration {
        const timingPhases = pRes.timingPhases || { wait: 0, dns: 0, total: elapsed };
        const { wait, dns, total } = timingPhases;
        return {
            connect: wait,
            dns,
            request: total - wait - dns
        };
    }

    private static generateDurationInfo(duration: Duration) {
        return `
            connect: ${duration.connect}
            dns: ${duration.dns}
            request: ${duration.request}
        `;
    }
}