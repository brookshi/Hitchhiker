import * as crypto from 'crypto';
import { Setting } from './setting';
import * as uuid from 'uuid';
import * as shortId from 'shortid';
import * as URL from 'url';
import { ParameterType, ReduceAlgorithmType } from '../common/enum/parameter_type';
import * as _ from 'lodash';
import { DtoHeader } from '../common/interfaces/dto_header';
import { PairwiseStrategy } from '../common/utils/pairwise';

export class StringUtil {

    static allParameter = 'All';

    static md5(str: string): string {
        return crypto.createHash('md5').update(str).digest('hex');
    }

    static md5Password(password: string): string {
        return Setting.instance.encryptPassword ? this.md5(password) : password;
    }

    static encrypt(str: string): string {
        const cipher = crypto.createCipher('aes-256-cbc', Setting.instance.app.encryptKey);
        let rst = cipher.update(str, 'utf8', 'base64');
        rst += cipher.final('base64');
        return rst;
    }

    static decrypt(str: string): string {
        const decipher = crypto.createDecipher('aes-256-cbc', Setting.instance.app.encryptKey);
        let rst = decipher.update(str, 'base64', 'utf8');
        rst += decipher.final('utf8');
        return rst;
    }

    static checkAutho(authorization: string) {
        return /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/.exec(authorization);
    }

    static applyTemplate(target: string, variables: { [key: string]: string }): string {
        let arr = new Array<string>();
        let regex = /{{.*?}}/g;
        let rst;
        while ((rst = regex.exec(target)) !== null) {
            arr.push(<string>rst[0]);
        }

        if (arr.length === 0) {
            return target;
        }

        arr.forEach(o => {
            let key = o.replace('{{', '').replace('}}', '');
            let variable = variables[key];
            if (variable !== undefined) {
                target = target.replace(o, variable);
            }
        });
        return target;
    }

    static generateUID(): string {
        return `${uuid.v1()}-${shortId.generate()}`;
    }

    static generateShortId(): string {
        return shortId.generate();
    }

    static getHostFromUrl(url: string): string {
        try {
            return url ? URL.parse(url).hostname : '';
        } catch (e) {
            return url;
        }
    }

    static readCookies(cookies: string): _.Dictionary<string> {
        const cookieDict: _.Dictionary<string> = {};
        cookies.split(';').map(c => c.trim()).forEach(c => cookieDict[c.substr(0, c.indexOf('=') || c.length)] = c);
        return cookieDict;
    }

    static readCookie(cookie: string): { key: string, value: string } {
        return { key: cookie.substr(0, cookie.indexOf('=') || cookie.length), value: cookie.substr(0, cookie.indexOf(';') || cookie.length) };
    }

    static stringToKeyValues(str: string): Array<{ key?: string, value?: string }> {
        return str.split('\n').map(k => {
            let [key, ...values] = k.split(':');
            const value: string | undefined = values.length === 0 ? undefined : values.join(':');
            return { key, value };
        });
    }

    static fixedEncodeURI(url: string) {
        try {
            const uri = this.parseUrl(url);
            uri.querys.forEach(q => q.value = q.value == null ? q.value : encodeURIComponent(q.value));
            return this.stringifyUrl(uri.url, uri.querys.map(q => ({ ...q, isActive: true })));

        } catch (e) {
            return url;
        }
    }

    static tryAddHttpPrefix(url: string) {
        const pattern = /^http[s]?:\/\//gi;
        if (!pattern.test(url)) {
            return `http://${url}`;
        }
        return url;
    }

    static fixedEncodeURIComponent(url: string) {
        return encodeURIComponent(url).replace(/[!'()*]/g, c => {
            return '%' + c.charCodeAt(0).toString(16);
        });
    }

    static verifyParameters(parameters: string, parameterType: ParameterType): { isValid: boolean, count: number, msg: string } {
        if (parameters === '') {
            return { isValid: false, count: 0, msg: '' };
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
            return { isValid: true, count, msg: '' };
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

    static getParameterArr(paramObj: any, parameterType: ParameterType, reduceAlgorithm: ReduceAlgorithmType): Array<any> {
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

    static parseParameters(parameters: string | undefined, parameterType: ParameterType, reduceAlgorithm: ReduceAlgorithmType): Array<any> {
        if (!parameters) {
            return [];
        }
        const { isValid } = StringUtil.verifyParameters(parameters || '', parameterType);
        let paramArr = isValid ? StringUtil.getParameterArr(JSON.parse(parameters || ''), parameterType, reduceAlgorithm) : new Array<any>();
        const paramDict = _.keyBy(paramArr, p => StringUtil.toString(p));
        return _.values(paramDict);
    }

    static toString(obj: any): string {
        if (_.isPlainObject(obj) || _.isArray(obj)) {
            return JSON.stringify(obj);
        } else {
            return obj ? obj.toString() : '';
        }
    }

    static stringToHeaders(str: string): Array<DtoHeader> {
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
}