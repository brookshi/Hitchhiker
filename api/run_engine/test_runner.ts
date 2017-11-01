import * as request from 'request';
import * as _ from 'lodash';
import { ProjectService } from '../services/project_service';
import * as freeVM from 'vm';
import { Setting } from '../utils/setting';
const { VM: safeVM } = require('vm2');

export class TestRunner {

    static defaultExport: any = 'export:impossiblethis:tropxe';

    static test(res: request.RequestResponse, globalFunc: string, code: string, elapsed: number): { tests: _.Dictionary<boolean>, variables: {}, export: {} } {
        let tests: { [key: string]: boolean } = {};
        let $variables$: any = {};
        let $exportObj$ = { content: TestRunner.defaultExport };
        let $export$ = obj => $exportObj$.content = obj;

        try {
            if (Setting.instance.safeVM) {
                const vm = new safeVM({
                    timeout: 50000,
                    sandbox: { tests, $variables$, $export$, $exportObj$, ...TestRunner.getInitSandbox(res, elapsed) }
                });
                vm.run(globalFunc + code);
            } else {
                const sandbox = safeVM.createContext({ tests, $variables$, $export$, $exportObj$, ...TestRunner.getInitSandbox(res, elapsed) });
                freeVM.runInContext(globalFunc + code, sandbox, { timeout: 50000 });
            }
        } catch (err) {
            tests = { [err]: false };
        }
        _.keys(tests).forEach(k => tests[k] = !!tests[k]);
        return { tests, variables: $variables$, export: $exportObj$.content };
    }

    static getInitSandbox(res: request.RequestResponse, elapsed: number) {
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