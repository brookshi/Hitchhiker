import * as VM from 'vm';
import * as Koa from 'koa';

export class TestRunner {

    static test(ctx: Koa.Context, code: string): { [key: string]: boolean } {
        TestRunner.init();
        TestRunner.setResponseData(ctx);
        VM.runInThisContext(code);

        return global['tests'];
    }

    static init() {
        let tests: { [key: string]: boolean } = {};
        global['tests'] = tests;
    }

    static setResponseData(ctx: Koa.Context) {
        global['responseBody'] = ctx.response.body;
        global['responseCode'] = ctx.response.status;
        try {
            global['responseObj'] = JSON.parse(ctx.response.body);
        }
        catch (e) {
            global['responseObj'] = e;
        }
        global['responseHeaders'] = ctx.response.headers;
        global['responseTime'] = '';//TODO: set time
    }
}