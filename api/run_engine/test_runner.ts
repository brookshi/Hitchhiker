import * as request from 'request';
import * as _ from 'lodash';
import { ProjectService } from '../services/project_service';
const { VM } = require('vm2');

export class TestRunner {

    static test(res: request.RequestResponse, globalFunc: string, code: string, elapsed: number): { tests: _.Dictionary<boolean>, variables: {} } {
        let tests: { [key: string]: boolean } = {};
        let $variables$: any = {};

        const vm = new VM({
            timeout: 50000,
            sandbox: { tests, $variables$, ...TestRunner.getInitSandbox(res, elapsed) }
        });

        try {
            vm.run(globalFunc + code);
        } catch (err) {
            tests = { [err]: false };
        }
        return { tests, variables: $variables$ };
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