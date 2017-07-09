import * as request from 'request';
import * as _ from 'lodash';
const { VM } = require('vm2');

export class TestRunner {

    static test(res: request.RequestResponse, code: string, elapsed: number): { [key: string]: boolean } {
        let tests: { [key: string]: boolean } = {};
        const vm = new VM({
            timeout: 50000,
            sandbox: { tests, ...TestRunner.getInitSandbox(res, elapsed) }
        });

        try {
            vm.run(code);
        } catch (err) {
            tests = { [err]: false };
        }
        return tests;
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
            responseTime: elapsed,
        };
    }
}