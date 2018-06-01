import { GlobalVar } from '../utils/global_var';

export default class LocalesString {

    static intl: any;

    static enMessages = require('./en');

    static zhMessages = require('./zh');

    static get(id: string, values?: {}) {
        if (!this.intl) {
            return this.getSpecial(id, values);
        }
        return this.intl.formatMessage({ id }, values);
    }

    static getSpecial(id: string, values?: {}) {
        let content = (this[`${GlobalVar.instance.lang}Messages`] || this['enMessages'])[id];
        if (values !== undefined) {
            Object.keys(values).forEach(k => {
                content = content.replace(`{${k}}`, values[k]);
            });
        }
        return content;
    }
}