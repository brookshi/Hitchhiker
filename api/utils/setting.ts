export class Setting {

    private _setting: any;

    static readonly instance = new Setting();

    private constructor() {
        this._setting = require('../../appconfig');
    }

    get needRegisterMailCheck(): boolean {
        return this._setting.user.registerMailCheck;
    }

    get mail() {
        return this._setting.mail;
    }

    get app() {
        return this._setting.app;
    }

    get schedule() {
        return this._setting.schedule;
    }
}