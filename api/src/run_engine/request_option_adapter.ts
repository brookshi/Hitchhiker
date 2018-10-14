import { RecordEx } from '../models/record';
import { Options, OptionsWithUrl } from 'request';
import { RecordService } from '../services/record_service';
import { ProjectService } from '../services/project_service';
import { StringUtil } from '../utils/string_util';
import { Setting } from '../utils/setting';
import { Header } from '../models/header';
import * as _ from 'lodash';
import { DataMode } from '../common/enum/data_mode';
import { ConsoleMessage } from '../services/console_message';
import { FuncUtil } from '../utils/func_util';

export class RequestOptionAdapter {
    static async fromRecord(record: RecordEx, cm: ConsoleMessage): Promise<Options> {
        cm.push('Apply default headers');
        record = RequestOptionAdapter.applyDefaultHeaders(record);
        if (record.uid) {
            cm.push('Apply localhost mapping');
            await RequestOptionAdapter.applyLocalhost(record, record.uid);
        }
        const { reqStrictSSL, reqFollowRedirect } = record.collection || { reqStrictSSL: false, reqFollowRedirect: false };
        const option: Options = {
            url: StringUtil.tryAddHttpPrefix(StringUtil.fixedEncodeURI(StringUtil.stringifyUrl(record.url, record.queryStrings))),
            method: record.method,
            headers: FuncUtil.formatKeyValue(record.headers),
            form: record.dataMode === DataMode.urlencoded ? FuncUtil.formatKeyValue(record.formDatas) : undefined,
            body: record.dataMode === DataMode.urlencoded ? null : record.body,
            strictSSL: reqStrictSSL,
            followRedirect: reqFollowRedirect,
            time: true,
            timeout: Setting.instance.requestTimeout,
        };
        if (this.isRequestImg(option.headers)) {
            option.encoding = null;
        }

        cm.push(`Generate request options: ${this.generateOptionInfo(option)}`);
        return option;
    }

    static isRequestImg(headers: { [key: string]: string }) {
        const accept = _.keys(headers).find(h => h.toLowerCase() === 'accept');
        return accept && headers[accept].indexOf('image') >= 0;
    }

    static async applyLocalhost(record: RecordEx, userId: string): Promise<any> {
        const regex = /^(http:\/\/|https:\/\/)?localhost(:|\/)/g;
        if (!regex.test(record.url)) {
            return;
        }
        const localhost = await ProjectService.getLocalhost(userId, record.collection.id);
        record.url = record.url.replace(regex, `$1${localhost}$2`);
        return;
    }

    static applyDefaultHeaders = (record: RecordEx) => {
        const defaultHeaders = StringUtil.stringToKeyValues(Setting.instance.defaultHeaders) as Header[];
        defaultHeaders.forEach(h => h.isActive = true);
        return {
            ...record,
            headers: _.unionBy(record.headers || [], defaultHeaders, 'key')
        };
    }

    private static generateOptionInfo(option: OptionsWithUrl) {
        return `                
                method: ${option.method}
                url: ${option.url}
                headers: ${Object.keys(option.headers || []).map(k => `${k || ''}:${option.headers[k] || ''}`).join('\n                         ')}
                body: ${option.body || ''}
                form: ${JSON.stringify(option.form || '')}
                strictSSL: ${option.strictSSL}
                followRedirect: ${option.followRedirect},
                timeout: ${option.timeout},
                encoding: ${option.encoding || 'none'}`;
    }
}