import { StringUtil } from './string_util';
import { DtoRecord } from '../../../api/interfaces/dto_record';
import * as words from 'shellwords';
import urlRegex from 'url-regex';
import { getDefaultRecord } from '../state/collection';

export class CurlImport {

    static do(target: string, collectionId: string = ''): DtoRecord | undefined {

        const content = this.prepare(target);
        if (!content.includes('curl ')) {
            return undefined;
        }

        const args = words.split(content);
        const result: DtoRecord = getDefaultRecord();
        result.method = 'GET';
        const headers = result.headers || [];
        let state = '';
        args.forEach((arg: any) => {
            if (urlRegex({ exact: true }).test(arg)) {
                result.url = arg;
                state = '';
            } else if (arg === '-I' || arg === '--head') {
                result.method = 'HEAD';
                state = '';
            } else {
                if (!state) {
                    state = this.parseState(arg);
                } else if (!!arg) {
                    switch (state) {
                        case 'header':
                            const headerItems = StringUtil.stringToKeyValues(arg);
                            headers.push(...headerItems);
                            break;
                        case 'user-agent':
                            headers.push({ key: 'User-Agent', value: arg, isActive: true });
                            break;
                        case 'data':
                            if (result.method === 'GET' || result.method === 'HEAD') {
                                result.method = 'POST';
                            }
                            const contentTypeHeader = headers.find(h => (h.key || '').toLowerCase() === 'content-type');
                            if (arg && !contentTypeHeader) {
                                headers.push({ key: 'Content-Type', value: 'application/x-www-form-urlencoded', isActive: true });
                            }
                            result.body = result.body ? `${result.body}&${arg}` : arg;
                            break;
                        case 'user':
                            headers.push({ key: 'Authorization', value: `Basic ${btoa(arg)}`, isActive: true });
                            break;
                        case 'method':
                            result.method = arg;
                            break;
                        case 'cookie':
                            headers.push({ key: 'Cookie', value: arg, isActive: true });
                            break;
                        default:
                            console.warn(`parse cURL miss ${arg}`);
                            break;
                    }
                    state = '';
                }
            }
        });

        return result;
    }

    private static parseState(arg: any): string {
        let state = '';
        switch (true) {
            case arg === '-A' || arg === '--user-agent':
                state = 'user-agent';
                break;
            case arg === '-H' || arg === '--header':
                state = 'header';
                break;
            case arg === '-d' || arg === '--data' || arg === '--data-ascii' || arg === '--data-binary':
                state = 'data';
                break;
            case arg === '-u' || arg === '--user':
                state = 'user';
                break;
            case arg === '-X' || arg === '--request':
                state = 'method';
                break;
            case arg === '-b' || arg === '--cookie':
                state = 'cookie';
                break;
            default:
                break;
        }
        return state;
    }

    private static prepare(curl: string): string {
        return curl.trim()
            .replace(/\\\r|\\\n|\s{2,}/g, '')
            .replace(/(-X)(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE)/, '$1 $2');
    }
}