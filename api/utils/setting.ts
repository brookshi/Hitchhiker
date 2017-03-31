
export class Setting {
    private _setting: any;

    static readonly instance = new Setting();

    private constructor() {
        this._setting = require('../../appconfig');
    }

    get mail() {
        return this._setting.mail;
    }
}