import * as uuid from 'uuid';
import { KeyValuePair } from '../misc/key_value_pair';
import { Beautify } from './beautify';
import * as shortId from 'shortid';
import { ParameterType, ReduceAlgorithmType } from '../misc/parameter_type';
import * as _ from 'lodash';
import { allParameter } from '../misc/constants';
import LocalesString from '../locales/string';
import { DtoHeader } from '../common/interfaces/dto_header';
import { PairwiseStrategy } from './pairwise';

export class StringUtil {
    static generateUID(): string {
        return `${uuid.v1()}-${shortId.generate()}`;
    }

    static base64(s: string) {
        return window.btoa(s);
    };

    static urlRegex(): RegExp {
        const protocol = `(?:(?:[a-z]+:)?//)`;
        const auth = '(?:\\S+(?::\\S*)?@)?';
        const ipv4 = '(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])(?:\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])){3}';
        const ip = new RegExp('^' + ipv4 + '$').source;
        const host = '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)';
        const domain = '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*';
        const tld = `(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))\\.?`;
        const port = '(?::\\d{2,5})?';
        const path = '(?:[/?#][^\\s"]*)?';
        const regex = `(?:${protocol}|www\\.)${auth}(?:localhost|${ip}|${host}${domain}${tld})${port}${path}`;

        return new RegExp(`(?:^${regex}$)`, 'i');
    }

    static parseUrl(url: string): { url: string, querys: { key: string, value: string }[] } {
        const arr = url.split('?');
        const result = { url: arr[0], querys: new Array<{ key: string, value: string }>() };
        if (arr.length < 2) {
            return result;
        }
        const queryStr = url.substr(url.indexOf('?'));
        const matchedQueryStr = queryStr === '?' ? '' : _.get(queryStr.match(/^\?([^#]+)/), '[1]');
        if (_.isString(matchedQueryStr)) {
            result.querys = matchedQueryStr.split('&').map(q => {
                let keyValue = q.split('=');
                return {
                    key: _.trim(keyValue[0]) || '',
                    value: keyValue[1] ? q.substr(q.indexOf('=') + 1) : keyValue[1],
                };
            });
        }
        return result;
    }

    static stringifyUrl(url: string, querys: DtoHeader[]) {
        const arr = (url || '').split('?');

        if (querys && querys.length) {
            let queryString = '';
            const activeQuerys = querys.filter(q => q.isActive && q.key != null);
            activeQuerys.forEach((q, i) => {
                queryString += `${q.key}${q.value != null ? '=' : ''}${q.value || ''}`;
                if (i !== activeQuerys.length - 1) {
                    queryString += '&';
                }
            });
            return `${arr[0]}${queryString != null ? '?' : ''}${queryString}`;
        }

        return url;
    }

    static applyTemplate(target?: string, variables?: { [key: string]: string }): string {
        if (!target) {
            return '';
        }

        let arr = new Array<string>();
        let regex = /{{.*?}}/g;
        let rst;
        while ((rst = regex.exec(target)) !== null) {
            arr.push(rst[0]);
        }

        if (arr.length === 0) {
            return target;
        }

        arr.forEach(o => {
            let key = o.replace('{{', '').replace('}}', '');
            let variable = (variables || {})[key];
            if (variable !== undefined) {
                target = (target || '').replace(o, variable);
            }
        });
        return target;
    }

    static upperFirstAlphabet(word: string): string {
        if (!word) {
            return word;
        }

        return word[0].toUpperCase() + word.substr(1);
    }

    static readCookies(cookies: string): _.Dictionary<string> {
        const cookieDict: _.Dictionary<string> = {};
        cookies.split(';').map(c => c.trim()).forEach(c => cookieDict[c.substr(0, c.indexOf('=') || c.length)] = c);
        return cookieDict;
    }

    static readCookie(cookie: string): { key: string, value: string } {
        return { key: cookie.substr(0, cookie.indexOf('=') || cookie.length), value: cookie.substr(0, cookie.indexOf(';') || cookie.length) };
    }

    static stringToKeyValues(str: string): Array<KeyValuePair> {
        return (str || '').split('\n').map(k => {
            let [key, ...values] = k.split(':');
            const value: string | undefined = values.length === 0 ? undefined : values.join(':');
            const isActive = !key.startsWith('//');

            if (!isActive) {
                key = key.substr(2);
            }

            return { isActive, key, value };
        });
    }

    static headersToString(headers: Array<KeyValuePair>): string {
        return headers ? headers.map(r => StringUtil.headerToString(r)).join('\n') : '';
    }

    static headerToString(header: KeyValuePair): string {
        const prefix = header.isActive ? '' : '//';
        const key = header.key === undefined || header.key === null ? '' : header.key;
        const value = header.value === undefined || header.value === null ? '' : `:${header.value}`;
        return `${prefix}${key}${value}`;
    }

    static isJson(value: string): boolean {
        try {
            JSON.parse(value);
            return true;
        } catch (ex) {
            return false;
        }
    }

    static beautify(value: string, header?: string, type?: 'json' | 'xml' | 'text') {
        if (!type) {
            type = StringUtil.isJson(value) ? 'json' : (header && header.indexOf('xml') > -1 ? 'xml' : 'text');
        }

        if (type === 'json') {
            return Beautify.json(value);
        } else if (type === 'xml') {
            return Beautify.xml(value);
        } else {
            return value;
        }
    }

    static getEditorType(value: string, header: string) {
        return StringUtil.isJson(value) ? 'json' : (header && header.indexOf('xml') > -1 ? 'xml' : 'text');
    }

    static isNumberString(str: string): boolean {
        const pattern = /^\d+$/;
        return pattern.test(str);
    }

    static checkEmail(email: string): boolean {
        const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(email);
    }

    static checkPassword(password: string): boolean {
        const pattern = /^[\da-zA-Z]{6,16}$/;

        return pattern.test(password);
    }

    static getNameFromEmail(email: string): string {
        return email ? email.substr(0, email.lastIndexOf('@')) : '';
    }

    static checkEmails(emails: string | string[]): { success: boolean, message: string, emails: string[] } {
        const separator = ';';
        const emailArr = emails instanceof Array ? emails : emails.split(separator);
        if (!emailArr || emailArr.length === 0) {
            return { success: false, message: LocalesString.get('Common.AtLeastOneEmail'), emails: [] };
        }

        const invalidEmailArr = emailArr.filter(e => !StringUtil.checkEmail(e));
        return {
            success: invalidEmailArr.length === 0,
            message: `${invalidEmailArr.join(';')} ${LocalesString.get('Common.invalid')}`,
            emails: emailArr.filter(e => StringUtil.checkEmail(e))
        };
    }

    static getHostFromUrl(url: string | undefined): string {
        try {
            return new URL(url || '').hostname;
        } catch (e) {
            return url || '';
        }
    }

    static getContentTypeFromHeaders(headers: { [key: string]: string | string[] }, defaultValue: string = 'json'): string {
        let contentType = defaultValue;
        const contentTypeValue = headers['content-type'];
        if (typeof contentTypeValue === 'string') {
            contentType = contentTypeValue;
        } else if (contentTypeValue && contentTypeValue.length > 0) {
            contentType = contentTypeValue[0];
        }
        return contentType;
    }

    static verifyParameters(parameters: string, parameterType: ParameterType): { isValid: boolean, count: number, msg: string } {
        if (parameters === '') {
            return { isValid: false, count: 0, msg: '' };
        }
        if (/^\{\{.*\}\}$/g.test(parameters)) {
            return { isValid: true, count: 0, msg: 'Variable parameters. ' };
        }
        let paramObj;
        let count = 0;
        try {
            paramObj = JSON.parse(parameters);
        } catch (e) {
            return { isValid: false, count, msg: e.toString() };
        }

        if (Array.isArray(paramObj)) {
            count = paramObj.length;
            return { isValid: true, count, msg: LocalesString.get('Collection.ParameterRequest', { length: count }) };
        }

        if (parameters !== '' && (!_.isPlainObject(paramObj) || !_.values<any>(paramObj).every(p => _.isArray(p)))) {
            return { isValid: false, count, msg: LocalesString.get('Collection.ParametersMustBeObj') };
        }
        const paramArray = _.values<Array<any>>(paramObj);
        if (parameterType === ParameterType.OneToOne) {
            for (let i = 0; i < paramArray.length; i++) {
                if (i === 0) {
                    count = paramArray[i].length;
                }
                if (paramArray[i].length !== count) {
                    return { isValid: false, count, msg: LocalesString.get('Collection.OneToOneTip') };
                }
            }
        } else {
            count = paramArray.length === 0 ? 0 : paramArray.map(p => p.length).reduce((p, c) => p * c);
        }

        return { isValid: true, count, msg: LocalesString.get('Collection.ParameterRequest', { length: count }) };
    }

    static getParameterArr(paramObj: any, parameterType: ParameterType, reduceAlgorithm?: ReduceAlgorithmType): Array<any> {
        const paramArr = new Array<any>();
        if (parameterType === ParameterType.OneToOne) {
            if (Array.isArray(paramObj)) {
                return paramObj;
            }
            Object.keys(paramObj).forEach((key) => {
                for (let i = 0; i < paramObj[key].length; i++) {
                    paramArr[i] = paramArr[i] || {};
                    paramArr[i][key] = paramObj[key][i];
                }
            });
        } else if (reduceAlgorithm === ReduceAlgorithmType.pairwise) {
            return PairwiseStrategy.GetTestCasesByObj(paramObj);
        } else {
            Object.keys(paramObj).forEach((key) => {
                let temp = [...paramArr];
                paramArr.splice(0, paramArr.length);
                for (let i = 0; i < paramObj[key].length; i++) {
                    if (temp.length === 0) {
                        paramArr[i] = paramArr[i] || {};
                        paramArr[i][key] = paramObj[key][i];
                    } else {
                        temp.forEach(t => {
                            paramArr.push({ ...t, [key]: paramObj[key][i] });
                        });
                    }
                }
            });
        }
        return paramArr;
    }

    static getUniqParamArr(parameters: string | undefined, parameterType: ParameterType, reduceAlgorithm?: ReduceAlgorithmType): Array<any> {
        const { isValid, count } = StringUtil.verifyParameters(parameters || '', parameterType);
        let paramArr = isValid && count > 0 ? StringUtil.getParameterArr(JSON.parse(parameters || ''), parameterType, reduceAlgorithm) : new Array<any>();
        const paramDict = _.keyBy(paramArr, p => StringUtil.toString(p));
        return _.values(paramDict);
    }

    static parseParameters(parameters: string | undefined, parameterType: ParameterType, currentParamIndex: string, reduceAlgorithm?: ReduceAlgorithmType): { currParam: string, paramArr: Array<any> } {
        const paramArr = StringUtil.getUniqParamArr(parameters, parameterType, reduceAlgorithm);
        const currParam = paramArr[Number.parseInt(currentParamIndex)] || allParameter;
        return { currParam, paramArr };
    }

    static toString(obj: any): string {
        if (_.isPlainObject(obj) || _.isArray(obj)) {
            return JSON.stringify(obj);
        } else {
            return obj.toString();
        }
    }
}
