import * as request from 'request';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectService } from '../services/project_service';
import { Setting } from '../utils/setting';
import { Sandbox } from './sandbox';
const { VM: safeVM } = require('vm2');

export class ScriptRunner {

    static prerequest(projectId: string, vid: string, envId: string, globalFunc: string, code: string): { success: boolean, message: string } {
        let hitchhiker, rst;
        try {
            hitchhiker = new Sandbox(projectId, vid, envId);
        } catch (ex) {
            rst = { success: false, message: ex };
        }
        rst = ScriptRunner.run({ hitchhiker, hh: hitchhiker }, globalFunc, code);
        return rst;
    }

    static test(projectId: string, vid: string, envId: string, res: request.RequestResponse, globalFunc: string, code: string, elapsed: number): { tests: _.Dictionary<boolean>, export: {} } {
        let hitchhiker, tests;
        try {
            hitchhiker = new Sandbox(projectId, vid, envId);
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

        const rst = ScriptRunner.run(sandbox, globalFunc, code);
        if (!rst.success) {
            tests[rst.message] = false;
        }
        _.keys(tests).forEach(k => tests[k] = !!tests[k]);
        return { tests, export: hitchhiker.exportObj.content };
    }

    private static run(sandbox: any, globalFunc: string, code: string): { success: boolean, message: string } {
        let success = true, message = '';
        try {
            code = globalFunc + code;
            const vm = new safeVM({ timeout: Setting.instance.scriptTimeout, sandbox });
            vm.run(code);
        } catch (err) {
            success = false;
            message = err;
        }
        return { success, message };
    }

    static getInitResObj(res: request.RequestResponse, elapsed: number) {
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