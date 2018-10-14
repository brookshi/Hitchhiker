import * as _ from 'lodash';
import { StringUtil } from './string_util';

export class FuncUtil {

    static formatKeyValue(keyValues: { key: string, value: string, isActive: boolean }[]) {
        let objs: { [key: string]: string } = {};
        keyValues.forEach(o => {
            if (o.isActive) {
                objs[o.key] = o.value;
            }
        });
        return objs;
    }

    static restoreKeyValue<T>(obj: { [key: string]: string }, fromDto: (dto: { isActive: boolean, key: string, value: string, id: string, sort: number }) => T) {
        const keyValues = [];
        _.keys(obj || {}).forEach(k => {
            keyValues.push(fromDto({
                isActive: true,
                key: k,
                value: obj[k],
                id: '',
                sort: 0
            }));
        });
        return keyValues;
    }

    static adjustAttachs<T extends { id: string, sort: number }>(attachs: T[]) {
        if (!attachs) {
            return;
        }
        attachs.forEach((attach, index) => {
            attach.id = attach.id || StringUtil.generateUID();
            attach.sort = index;
        });
    }
}