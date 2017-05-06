import * as uuid from 'uuid';
import { KeyValuePair } from '../common/key_value_pair';

export class StringUtil {
    static generateUID(): string {
        return uuid.v1();
    }

    static stringToKeyValues(str: string): Array<KeyValuePair> {
        return str.split('\n').map(k => {
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
        return headers ? headers.map(r => this.headerToString(r)).join('\n') : '';
    }

    static headerToString(header: KeyValuePair): string {
        const prefix = header.isActive ? '' : '//';
        const key = StringUtil.undefinedToString(header.key);
        const value = header.value === undefined ? '' : `:${header.value}`;
        return `${prefix}${key}${value}`;
    }

    static undefinedToString(str: string): string {
        return str === undefined ? '' : str;
    }
}
