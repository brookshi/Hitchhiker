import * as VM from 'vm';
import * as request from 'request';
import * as _ from 'lodash';

export class TestRunner {

    static test(res: request.RequestResponse, code: string, elapsed: number): { [key: string]: boolean } {
        TestRunner.init();
        TestRunner.setResponseData(res, elapsed);
        try {
            VM.runInThisContext(code);
        } catch (err) {
            return { [err]: false };
        }
        return _.clone(global['tests']);
    }

    static init() {
        let tests: { [key: string]: boolean } = {};
        global['tests'] = tests;
    }

    static setResponseData(res: request.RequestResponse, elapsed: number) {
        global['responseBody'] = res.body;
        global['responseCode'] = { code: res.statusCode, name: res.statusMessage };
        try {
            global['responseObj'] = JSON.parse(res.body); // TODO: more response type, xml, protobuf, zip, chunk...
        } catch (e) {
            global['responseObj'] = e;
        }
        global['responseHeaders'] = res.headers;
        global['responseTime'] = elapsed;
    }
}