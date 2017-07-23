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

    get appApi() {
        return `${process.env.HITCHHIKER_APP_HOST}/api/` || this.app.api;
    }

    get appHost() {
        return process.env.HITCHHIKER_APP_HOST || this.app.host;
    }

    get appLanguage() {
        return process.env.HITCHHIKER_APP_LANG || this.app.language;
    }

    get schedule() {
        return this._setting.schedule;
    }

    get scheduleDuration() {
        return process.env.HITCHHIKER_SCHEDULE_DURATION || this.schedule.duration;
    }

    get scheduleMaxCount() {
        return process.env.HITCHHIKER_SCHEDULE_COUNT || this.schedule.storeMaxCount;
    }

    get db() {
        return this._setting.db;
    }
}