import * as request from 'request';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectService } from '../services/project_service';
import { Setting } from '../utils/setting';
import { Sandbox } from './sandbox';
import * as freeVM from 'vm';
import { ResObject } from '../common/res_object';
import { Log } from '../utils/log';
import { Record } from '../models/record';
const { NodeVM: safeVM } = require('vm2');

export class ScriptRunner {

    static async prerequest(projectId: string, vid: string, envId: string, envName: string, globalFunc: string, commonPreScriptWithVar: string, code: string, record: Record): Promise<ResObject> {
        let hitchhiker: Sandbox, res: ResObject;
        try {
            hitchhiker = new Sandbox(projectId, vid, envId, envName, record);
        } catch (ex) {
            res = { success: false, message: ex };
        }
        const script = `
            ${commonPreScriptWithVar}
            ${code}
        `;
        res = await ScriptRunner.run({ hitchhiker, hh: hitchhiker }, globalFunc, script);
        res.result = hitchhiker.request;
        return res;
    }

    static async test(projectId: string, vid: string, envId: string, envName: string, res: request.RequestResponse, globalFunc: string, code: string, elapsed: number): Promise<{ tests: _.Dictionary<boolean>, export: {} }> {
        let hitchhiker, tests;
        try {
            hitchhiker = new Sandbox(projectId, vid, envId, envName);
        } catch (ex) {
            tests = {};
            tests[ex] = false;
        }
        if (!hitchhiker) {
            return { tests, export: undefined };
        }
        tests = hitchhiker.tests;
        const $variables$: any = hitchhiker.variables;
        const $export$ = hitchhiker.export;

        const sandbox = { hitchhiker, hh: hitchhiker, $variables$, $export$, tests, ...ScriptRunner.getInitResObj(res, elapsed) };

        const rst = await ScriptRunner.run(sandbox, globalFunc, code);
        if (!rst.success) {
            tests[rst.message] = false;
        }
        _.keys(tests).forEach(k => tests[k] = !!tests[k]);
        return { tests, export: hitchhiker.exportObj.content };
    }

    private static run(sandbox: any, globalFunc: string, code: string): Promise<ResObject> {
        let success = true, message = '';
        try {
            code = `module.exports = function(callback) { 
                    void async function() { 
                        try{
                            ${globalFunc || ''};
                            ${code || ''};
                            callback();
                        }catch(err){
                            callback(err);
                        }
                    }(); 
                }`;
            const vm = new safeVM({ timeout: Setting.instance.scriptTimeout, sandbox });
            const runWithCallback = vm.run(code);
            return new Promise<ResObject>((resolve, reject) => {
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

    private static getInitResObj(res: request.RequestResponse, elapsed: number) {
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
            responseTime: elapsed
        };
    }
}