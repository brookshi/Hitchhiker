import * as request from 'request';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectService } from '../services/project_service';
import * as freeVM from 'vm';
import { Setting } from '../utils/setting';
const { VM: safeVM } = require('vm2');

class Sandbox {

    _jsFiles: _.Dictionary<string> = {};

    _allFiles: _.Dictionary<string> = {};

    tests: _.Dictionary<boolean> = {};

    variables: any = {};

    exportObj = { content: TestRunner.defaultExport };

    constructor(projectId: string) {
        const globalFolder = path.join(__dirname, `../global_data`);
        const projectFolder = `${globalFolder}/${projectId}`;
        const initFiles = folder => {
            if (fs.existsSync(folder)) {
                const files = fs.readdirSync(folder).filter(value => fs.lstatSync(path.join(folder, value)).isFile);
                files.forEach(f => {
                    if (f.endsWith('.js')) {
                        const fname = f.substr(0, f.length - 3);
                        this._jsFiles[f.substr(0, f.length - 3)] = `${folder}/${fname}`;
                    }
                    this._allFiles[f] = `${folder}/${f}`;
                });
            }
        };
        initFiles(globalFolder);
        initFiles(projectFolder);
    }

    require(lib: string) {
        return require(this._jsFiles[lib]);
    }

    export(obj: any) {
        this.exportObj.content = obj;
    };
}

export class TestRunner {

    static defaultExport: any = 'export:impossiblethis:tropxe';

    static test(projectId: string, res: request.RequestResponse, globalFunc: string, prescript: string, code: string, elapsed: number): { tests: _.Dictionary<boolean>, variables: {}, export: {} } {
        const hitchhiker = new Sandbox(projectId);
        const tests = hitchhiker.tests;
        const $variables$: any = hitchhiker.variables;
        const $export$ = hitchhiker.export;

        const sandbox = { hitchhiker, hh: hitchhiker, $variables$, $export$, tests, ...TestRunner.getInitSandbox(res, elapsed) };

        try {
            if (!Setting.instance.safeVM) {
                const vm = new safeVM({ timeout: 50000, sandbox });
                vm.run(globalFunc + prescript + code);
            } else {
                freeVM.runInContext(globalFunc + prescript + code, freeVM.createContext(sandbox), { timeout: 50000 });
            }
        } catch (err) {
            tests[err] = false;
        }
        _.keys(tests).forEach(k => tests[k] = !!tests[k]);
        return { tests, variables: $variables$, export: hitchhiker.exportObj.content };
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