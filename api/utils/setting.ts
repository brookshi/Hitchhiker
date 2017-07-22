export class Setting {

    private _setting: any;

    static readonly instance = new Setting();

    private constructor() {
        this._setting = require('../../appconfig');
    }

    get needRegisterMailConfirm(): boolean {
        return this._setting.user.registerMailConfirm;
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

    get db() {
        return this._setting.db;
    }
}