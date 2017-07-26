import * as fs from 'fs';
import * as path from 'path';

export class Setting {

    private _setting: any;

    static readonly instance = new Setting();

    private constructor() {
        this._setting = require('../../appconfig');
    }

    init() {
        const frontEndJSFolder = path.join(__dirname, '../public/static/js');
        if (!fs.existsSync(frontEndJSFolder)) {
            console.warn(`dir ${frontEndJSFolder} is not a valid path`);
            return;
        }
        const files = fs.readdirSync(frontEndJSFolder).filter(value => value.endsWith('.js') && fs.lstatSync(path.join(frontEndJSFolder, value)).isFile);
        files.forEach(file => {
            const filePath = path.join(frontEndJSFolder, file);
            let content = fs.readFileSync(filePath, 'utf8');
            content = content.replace('HITCHHIKER_APP_HOST', this.appHost);
            fs.writeFileSync(filePath, content, { encoding: 'utf8' });
        });
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
        return `${process.env.HITCHHIKER_APP_HOST}api/` || this.app.api;
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