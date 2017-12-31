import * as uuid from 'uuid';
import { KeyValuePair } from '../common/key_value_pair';
import { Beautify } from './beautify';
import * as shortId from 'shortid';
import { ParameterType } from '../common/parameter_type';
import * as _ from 'lodash';
import { allParameter } from '../common/constants';

export class StringUtil {
    static generateUID(): string {
        return `${uuid.v1()}-${shortId.generate()}`;
    }

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
        const pattern = /^[^@]+@[^\.@]+\.[a-zA-Z]+$/;
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
            return { success: false, message: 'at least one email', emails: [] };
        }

        const invalidEmailArr = emailArr.filter(e => !StringUtil.checkEmail(e));
        return {
            success: invalidEmailArr.length === 0,
            message: `${invalidEmailArr.join(';')} is invalid`,
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
        if (parameters !== '' && (!_.isPlainObject(paramObj) || !_.values<any>(paramObj).every(p => _.isArray(p)))) {
            return { isValid: false, count, msg: 'Parameters must be a plain object and children must be a array.' };
        }
        const paramArray = _.values<Array<any>>(paramObj);
        if (parameterType === ParameterType.OneToOne) {
            for (let i = 0; i < paramArray.length; i++) {
                if (i === 0) {
                    count = paramArray[i].length;
                }
                if (paramArray[i].length !== count) {
                    return { isValid: false, count, msg: `The length of OneToOne parameters' children arrays must be identical.` };
                }
            }
        } else {
            count = paramArray.length === 0 ? 0 : paramArray.map(p => p.length).reduce((p, c) => p * c);
        }

        return { isValid: true, count, msg: `${count} requests: ` };
    }

    static getParameterArr(paramObj: any, parameterType: ParameterType): Array<any> {
        const paramArr = new Array<any>();
        if (parameterType === ParameterType.OneToOne) {
            Object.keys(paramObj).forEach((key, index) => {
                for (let i = 0; i < paramObj[key].length; i++) {
                    paramArr[i] = paramArr[i] || {};
                    paramArr[i][key] = paramObj[key][i];
                }
            });
        } else {
            Object.keys(paramObj).forEach((key, index) => {
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

    static getUniqParamArr(parameters: string | undefined, parameterType: ParameterType): Array<any> {
        const { isValid, count } = StringUtil.verifyParameters(parameters || '', parameterType);
        let paramArr = isValid && count > 0 ? StringUtil.getParameterArr(JSON.parse(parameters || ''), parameterType) : new Array<any>();
        const paramDict = _.keyBy(paramArr, p => StringUtil.toString(p));
        return _.values(paramDict);
    }

    static parseParameters(parameters: string | undefined, parameterType: ParameterType, currentParamIndex: string): { currParam: string, paramArr: Array<any> } {
        const paramArr = StringUtil.getUniqParamArr(parameters, parameterType);
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
