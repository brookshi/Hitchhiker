import { GlobalVar } from '../utils/global_var';

export default class LocalesString {

    static intl: any;

    static enMessages = require('./en');

    static zhMessages = require('./zh');

    static get(id: string, values?: {}) {
        if (!this.intl) {
            return this.getSpecial(id);
        }
        return this.intl.formatMessage({ id }, values);
    }

    static getSpecial(id: string) {
        return this[`${GlobalVar.instance.lang}Messages`][id];
    }
}