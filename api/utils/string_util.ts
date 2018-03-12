import * as crypto from 'crypto';
import { Setting } from './setting';
import * as uuid from 'uuid';
import * as shortId from 'shortid';
import * as URL from 'url';
import { ParameterType } from '../common/parameter_type';
import * as _ from 'lodash';
import { DtoHeader } from '../interfaces/dto_header';

export class StringUtil {

    static allParameter = 'All';

    static md5(str: string): string {
        return crypto.createHash('md5').update(str).digest('hex');
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
            const uri = URL.parse(url, true);
            uri.search = '';
            let i = 0;
            for (let k of _.keys(uri.query)) {
                uri.search += `${i > 0 ? '&' : ''}${k}=${encodeURIComponent(uri.query[k])}`;
                i++;
            }
            return URL.format(uri);

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

    static parseParameters(parameters: string | undefined, parameterType: ParameterType): Array<any> {
        if (!parameters) {
            return [];
        }
        const { isValid } = StringUtil.verifyParameters(parameters || '', parameterType);
        let paramArr = isValid ? StringUtil.getParameterArr(JSON.parse(parameters || ''), parameterType) : new Array<any>();
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
}