import { Setting } from '../utils/setting';

export class Message {

    static en = require('../locales/en.json');

    static zh = require('../locales/zh.json');

    static get(id: string) {
        return (this[Setting.instance.appLanguage] || this['en'])[id];
    }
}    