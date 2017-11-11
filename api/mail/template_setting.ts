export class TemplateSetting {
    private _setting: any;

    static readonly instance = new TemplateSetting();

    private constructor() {
        this._setting = require('../../mail.json');
    }

    get templates() {
        return this._setting.templates;
    }
}