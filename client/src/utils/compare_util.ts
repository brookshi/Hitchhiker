import { DtoRecord } from '../../../api/interfaces/dto_record';
import { StringUtil } from './string_util';

export class CompareUtil {

    static compare(o: DtoRecord, t: DtoRecord): boolean {
        return o.collectionId === t.collectionId &&
            (o.pid || '') === (t.pid || '') &&
            o.category === t.category &&
            o.name === t.name &&
            (o.url || '') === (t.url || '') &&
            (o.method || '') === (t.method || '') &&
            StringUtil.headersToString(o.headers as any) === StringUtil.headersToString(t.headers as any) &&
            (o.body || '') === (t.body || '') &&
            o.bodyType === t.bodyType &&
            (o.parameters || '') === (t.parameters || '') &&
            o.parameterType === t.parameterType &&
            (o.test || '') === (t.test || '');
    }
}