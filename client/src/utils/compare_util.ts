import { DtoRecord } from '../common/interfaces/dto_record';
import { StringUtil } from './string_util';
import * as _ from 'lodash';

export class CompareUtil {

    static compare(o: DtoRecord, t: DtoRecord): boolean {
        if ((!o && t) || (o && !t)) {
            return false;
        }
        return (!o && !t) ||
            (o.collectionId === t.collectionId &&
                (o.pid || '') === (t.pid || '') &&
                o.category === t.category &&
                o.name === t.name &&
                o.description === t.description &&
                (o.url || '') === (t.url || '') &&
                (o.method || 'GET') === (t.method || 'GET') &&
                StringUtil.headersToString(o.headers as any, true) === StringUtil.headersToString(t.headers as any, true) &&
                StringUtil.headersToString(o.queryStrings as any, true) === StringUtil.headersToString(t.queryStrings as any, true) &&
                StringUtil.headersToString(o.formDatas as any, true) === StringUtil.headersToString(t.formDatas as any, true) &&
                (o.body || '') === (t.body || '') &&
                (o.bodyType || '') === (t.bodyType || '') &&
                (o.bodyType || '') === (t.bodyType || '') &&
                (o.parameters || '') === (t.parameters || '') &&
                o.parameterType === t.parameterType &&
                o.reduceAlgorithm === t.reduceAlgorithm &&
                _.isEqual(o.assertInfos, t.assertInfos) &&
                (o.test || '') === (t.test || '') &&
                (o.prescript || '') === (t.prescript || ''));
    }
}