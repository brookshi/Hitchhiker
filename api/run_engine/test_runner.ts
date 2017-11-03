import * as request from 'request';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectService } from '../services/project_service';
import * as freeVM from 'vm';
import { Setting } from '../utils/setting';
import { Sandbox } from './sandbox';
const { VM: safeVM } = require('vm2');

export class JSRunner {

    static prerequest(projectId: string, globalFunc: string, code: string): { success: boolean, message: string } {
        const hitchhiker = new Sandbox(projectId);
        return JSRunner.run({ hitchhiker, hh: hitchhiker }, globalFunc, code);
    }

    static test(projectId: string, res: request.RequestResponse, globalFunc: string, code: string, elapsed: number): { tests: _.Dictionary<boolean>, variables: {}, export: {} } {
        const hitchhiker = new Sandbox(projectId);
        const tests = hitchhiker.tests;
        const $variables$: any = hitchhiker.variables;
        const $export$ = hitchhiker.export;

        const sandbox = { hitchhiker, hh: hitchhiker, $variables$, $export$, tests, ...JSRunner.getInitResObj(res, elapsed) };

        const rst = JSRunner.run(sandbox, globalFunc, code);
        if (!rst.success) {
            tests[rst.message] = false;
        }
        _.keys(tests).forEach(k => tests[k] = !!tests[k]);
        return { tests, variables: $variables$, export: hitchhiker.exportObj.content };
    }

    private static run(sandbox: any, globalFunc: string, code: string): { success: boolean, message: string } {
        let success = true, message = '';
        try {
            code = globalFunc + code;
            if (Setting.instance.safeVM) {
                const vm = new safeVM({ timeout: Setting.instance.scriptTimeout, sandbox });
                vm.run(code);
            } else {
                freeVM.runInContext(code, freeVM.createContext(sandbox), { timeout: Setting.instance.scriptTimeout });
            }
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