
export class Setting {
    private _setting: any;

    static readonly instance = new Setting();

    private constructor() {
        this._setting = require('../../appconfig');
    }

    get needRegisterMailCheck() {
        return this._setting.registerMailCheck;
    }

    get mail() {
        return this._setting.mail;
    }

    get app() {
        return this._setting.app;
    }
}