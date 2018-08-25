import * as request from 'request';
import * as _ from 'lodash';
import { Setting } from '../utils/setting';
import { Sandbox } from './sandbox';
import { ResObject } from '../interfaces/res_object';
import { Log } from '../utils/log';
import { RecordEx } from '../models/record';
import { ConsoleMsg } from '../common/interfaces/dto_res';
const { NodeVM: safeVM } = require('vm2');

export class ScriptRunner {

    static async prerequest(record: RecordEx): Promise<ResObject> {
        const { pid, vid, uid, envId, envName, envVariables, prescript } = record;
        let hitchhiker: Sandbox, res: ResObject;
        try {
            hitchhiker = new Sandbox(pid, uid || vid, envId, envName, envVariables, record);
        } catch (ex) {
            res = { success: false, message: ex };
        }

        res = await ScriptRunner.run({ hitchhiker, hh: hitchhiker, hkr: hitchhiker, console: hitchhiker.console }, prescript);
        res.result = { request: hitchhiker.request, consoleMsgQueue: hitchhiker.console.msgQueue };
        return res;
    }

    static async test(record: RecordEx, res: request.RequestResponse): Promise<{ tests: _.Dictionary<boolean>, export: {}, consoleMsgQueue: Array<ConsoleMsg>, error?: string }> {
        const { pid, vid, uid, envId, envName, envVariables, test } = record;
        let hitchhiker, tests;
        try {
            hitchhiker = new Sandbox(pid, uid || vid, envId, envName, envVariables, record);
        } catch (ex) {
            tests = {};
            tests[ex] = false;
        }
        if (!hitchhiker) {
            return { tests, export: undefined, consoleMsgQueue: hitchhiker.console.msgQueue };
        }
        tests = hitchhiker.tests;
        const $variables$: any = hitchhiker.variables;
        const $export$ = hitchhiker.export;

        const sandbox = { hitchhiker, hh: hitchhiker, hkr: hitchhiker, $variables$, $export$, tests, console: hitchhiker.console, ...ScriptRunner.getInitResObj(res) };

        const rst = await ScriptRunner.run(sandbox, test);
        if (!rst.success) {
            tests[rst.message] = false;
        }
        _.keys(tests).forEach(k => tests[k] = !!tests[k]);
        return { tests, export: hitchhiker.exportObj.content, consoleMsgQueue: hitchhiker.console.msgQueue, error: rst.success ? undefined : rst.message.toString() };
    }

    private static run(sandbox: any, code: string): Promise<ResObject> {
        let success = true, message = '';
        try {
            code = `module.exports = function(callback) { 
                    void async function() { 
                        let msg;
                        try{
                            ${code || ''};
                        }catch(err){
                            msg = err;
                        }finally{
                            callback(msg);
                        }
                    }(); 
                }`;
            const vm = new safeVM({ timeout: Setting.instance.scriptTimeout, sandbox });
            const runWithCallback = vm.run(code);
            return new Promise<ResObject>((resolve) => {
                runWithCallback((err) => {
                    if (err) {
                        Log.error(err);
                    }
                    resolve({ success: !err, message: err });
                });
            });

            // freeVM.runInContext(code, freeVM.createContext(sandbox), { timeout: 50000 });
        } catch (err) {
            success = false;
            message = err;
            Log.error(err);
        }
        return Promise.resolve({ success, message });
    }

    private static getInitResObj(res: request.RequestResponse) {
        let responseObj = {};
        try {
            responseObj = JSON.parse(res.body); // TODO: more response type, xml, protobuf, zip, chunk...
        } catch (e) {
            responseObj = e;
        }
        return {
            responseBody: res.body,
            responseCode: { code: res.statusCode, name: res.statusMessage },
            responseObj,
            responseHeaders: res.headers,
            responseTime: res.timingPhases.total >> 0
        };
    }
}