import { DtoRecord } from '../../../api/interfaces/dto_record';
import { StringUtil } from '../utils/string_util';
import { DataMode } from './custom_type';

export interface HARNameValue {

    name: string;

    value: string;
}

export interface HARPostData {

    params: HARNameValue[];

    mimeType: string;

    text: string;
}

export class HAR {

    method: string;

    url: string;

    headers: HARNameValue[];

    cookies: HARNameValue[];

    postData: HARPostData;

    constructor(private record: DtoRecord) {
        this.method = record.method || 'GET';
        this.url = StringUtil.stringifyUrl(record.url || '', record.queryStrings || []);
        this.headers = (record.headers || []).filter(h => h.isActive).map(h => ({ name: h.key || '', value: h.value || '' }));
        this.generateCookie();
        this.generatePostData();
    }

    generateCookie() {
        const cookieHeader = (this.record.headers || []).filter(h => h.isActive).find(h => (h.key || '').toLowerCase() === 'cookie');
        if (cookieHeader) {
            const cookieDict = StringUtil.readCookies(cookieHeader.value || '');
            this.cookies = Object.keys(cookieDict).map(c => ({ name: c, value: cookieDict[c] }));
        } else {
            this.cookies = [];
        }
    }

    generatePostData() {
        const contentTypeHeader = (this.record.headers || []).find(header => (header.key || '').toLowerCase() === 'content-type');
        let mimeType: string = '';
        if (contentTypeHeader) {
            mimeType = contentTypeHeader.value || '';
        }
        let text = this.record.body || '';
        let params = new Array<HARNameValue>();
        try {
            if (this.record.dataMode === DataMode.urlencoded) {
                params = (this.record.formDatas || []).filter(h => h.isActive).map(h => ({ name: h.key || '', value: h.value || '' }));
            } else if (mimeType === 'application/x-www-form-urlencoded' && text) {
                text = decodeURIComponent(text.replace('+', '%20'));
                text.split('&').forEach(pair => {
                    const [name, value] = pair.split('=');
                    params.push({ name, value });
                });
            }
        } catch (e) {
            console.error(`generate post data error: ${e}`);
        }
        this.postData = {
            params,
            mimeType,
            text
        };
    }
}