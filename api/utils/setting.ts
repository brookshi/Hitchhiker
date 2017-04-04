
export class Setting {
    private _setting: any;

    static readonly instance = new Setting();

    private constructor() {
        this._setting = require('../../appconfig');
    }

    get needRegisterMailCheck() {
        return this._setting.registerMailCheck;
    }
}