import { RequestImport } from '../base/request_import';
import { Record } from '../../models/record';
import * as yargs from 'yargs';
import { StringUtil } from '../../utils/string_util';
import { DtoHeader } from '../../common/interfaces/dto_header';
import { RecordService } from '../record_service';
import { RecordCategory } from '../../common/enum/record_category';
import { ParameterType } from '../../common/enum/parameter_type';

export class CurlImport implements RequestImport<string> {

    convert(target: string, collectionId: string): Record {

        const content = this.prepare(target);
        const args = yargs([content]);

        const url = this.parseUrl(args);
        const headers = this.parseHeaders(args);
        const body = this.parseBody(args, headers);
        const method = this.parseMethod(args, body);

        return RecordService.fromDto({
            id: StringUtil.generateUID(),
            collectionId,
            category: RecordCategory.record,
            name: url,
            parameterType: ParameterType.ManyToMany,
            method,
            body,
            headers,
            url
        });
    }

    private prepare(curl: string): string {
        return curl.trim()
            .replace(/\\\r|\\\n|\s{2,}/g, '')
            .replace(/(-X)(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE)/, '$1 $2');
    }

    private parseUrl(args: yargs.Arguments): string {
        let url = args._[1];
        if (!url) {
            url = args.L || args.location || args.compressed || args.url;
        }
        return url;
    }

    private parseMethod(args: yargs.Arguments, body: any): string {
        let method: string = args.X || args.request;
        if (!method) {
            method = body ? 'POST' : 'GET';
        }

        if (args.I || args.head) {
            method = 'HEAD';
        }

        return method;
    }

    private parseHeaders(args: yargs.Arguments): DtoHeader[] {
        let headers = new Array<DtoHeader>();
        const headersTxt = args.H || args.header;
        if (headersTxt) {
            headers = StringUtil.stringToHeaders(Array.isArray(headersTxt) ? headersTxt.join('\n') : headersTxt);
        }

        const cookieStr: string = args.b || args.cookie;
        if (cookieStr && cookieStr.includes('=')) {
            headers.push({ key: 'Cookie', value: cookieStr, isActive: true });
        }

        let user = args.u || args.user;
        if (user) {
            headers.push({ key: 'Authorization', value: `Basic ${new Buffer(user).toString('base64')}`, isActive: true });
        }

        let agent = args.A || args['user-agent'];
        if (agent) {
            headers.push({ key: 'User-Agent', value: agent, isActive: true });
        }

        return headers;
    }

    private parseBody(args: yargs.Arguments, headers: DtoHeader[]): any {
        const contentTypeHeader = headers.find(h => (h.key || '').toLowerCase() === 'content-type');
        let body = args.d || args.data || args['data-binary'];
        if (Array.isArray(body)) {
            body = body.join('&');

        }

        if (body && !contentTypeHeader) {
            headers.push({ key: 'Content-Type', value: Array.isArray(body) ? 'application/x-www-form-urlencoded' : 'application/json', isActive: true });
        }

        return body;
    }
}