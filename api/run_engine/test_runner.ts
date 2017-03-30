import * as VM from 'vm';
import * as Koa from 'koa';
import * as request from "request";

export class TestRunner {

    static test(res: request.RequestResponse, code: string): { [key: string]: boolean } {
        TestRunner.init();
        TestRunner.setResponseData(res);
        VM.runInThisContext(code);

        return global['tests'];
    }

    static init() {
        let tests: { [key: string]: boolean } = {};
        global['tests'] = tests;
    }

    static setResponseData(res: request.RequestResponse) {
        global['responseBody'] = res.body;
        global['responseCode'] = res.statusCode;
        try {
            global['responseObj'] = JSON.parse(res.body);
        }
        catch (e) {
            global['responseObj'] = e;
        }
        global['responseHeaders'] = res.headers;
        global['responseTime'] = '';//TODO: set time
    }
}