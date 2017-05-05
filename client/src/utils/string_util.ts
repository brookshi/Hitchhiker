import * as uuid from 'uuid';
import { KeyValuePair } from '../common/key_value_pair';

export class StringUtil {
    static generateUID(): string {
        return uuid.v1();
    }

    static stringToKeyValues(str: string): Array<KeyValuePair> {
        return str.split('\n').map(k => {
            let [key, value] = k.split(':').map(v => v.trim());
            const isActive = !key.startsWith('//');

            if (!isActive) {
                key = key.substr(2);
            }

            return { isActive, key, value };
        });
    }

    static headersToString(headers: Array<KeyValuePair>) {
        return headers ? headers.map(r => `${r.isActive ? '' : '//'}${r.key || ''}${r.key && r.value ? ': ' + r.value : ''}`).join('\n') : '';
    }
}
