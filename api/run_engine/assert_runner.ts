import { RecordEx } from '../models/record';
import * as _ from 'lodash';
import * as request from 'request';
import { noEnvironment } from '../common/stress_type';

export class AssertRunner {

    static run(record: RecordEx, res: request.RequestResponse, tests: any) {
        const { envName, assertInfos } = record;
        const infos = _.flatten(_.values(assertInfos)).filter(info => info.env === envName || info.env === 'All' || info.env === noEnvironment || !info.env);
        infos.forEach(info => {
            try {
                tests[info.name] = this.runAssert(info.target, info.function, info.value, this.getResponseObj(res));
            } catch (e) {
                tests[`${info.name}: ${e}`] = false;
            }
        });
    }

    private static runAssert(keys: string[], func: string, value: string, responseObj: any) {
        const target = this.getTarget(keys, responseObj);
        let type = typeof target;
        if (this.isLenOper(func)) {
            return eval(`${target['length']} ${func.replace('length', '').trim()} ${value}`);
        } else if (this.isCompareOper(func)) {
            if (type === 'number') {
                return eval(`${target} ${func} ${value}`);
            } else {
                return eval(`'${target}' ${func} '${value}'`);
            }
        } else if (func === 'custom') {
            return eval(`target.${value}`);
        } else if (['true', 'false'].find(o => o === func)) {
            return target === (func === 'true' ? true : false);
        } else {
            return eval(target[func](eval(value)));
        }
    }

    private static getResponseObj(res: request.RequestResponse) {
        let responseObj = {};
        try {
            responseObj = JSON.parse(res.body);
        } catch (e) {
            responseObj = e;
        }
        return responseObj;
    }

    private static getTarget(keys: string[], responseObj: any) {
        let target = responseObj;
        for (let i = keys.length - 2; i >= 0; i--) {
            target = target[keys[i]];
        }
        return target;
    }

    private static isCompareOper(func: string) {
        return ['>', '=', '<'].some(o => func.includes(o));
    }

    private static isLenOper(func: string) {
        return func.includes('length');
    }
}