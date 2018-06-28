import * as fs from 'fs';
import * as path from 'path';
import { Log } from './log';

export class Setting {

    private _setting: any;

    static readonly instance = new Setting();

    private constructor() {
        this._setting = require('../../appconfig');
    }

    init() {
        const frontEndJSFolder = path.join(__dirname, '../public/static/js');
        if (!fs.existsSync(frontEndJSFolder)) {
            Log.warn(`dir ${frontEndJSFolder} is not a valid path`);
            return;
        }
        const files = fs.readdirSync(frontEndJSFolder).filter(value => value.endsWith('.js') && fs.lstatSync(path.join(frontEndJSFolder, value)).isFile);
        files.forEach(file => {
            const filePath = path.join(frontEndJSFolder, file);
            let content = fs.readFileSync(filePath, 'utf8');
            content = content.replace('HITCHHIKER_APP_HOST', this.appHost).replace(/hitchhiker_\w+?(?=")/g, `hitchhiker_${this.appLanguage}`);
            fs.writeFileSync(filePath, content, { encoding: 'utf8' });
        });
    }

    get env() {
        return this.app.env;
    }

    get isDev() {
        return this.env === 'DEV';
    }

    get isProd() {
        return this.env === 'PROD';
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
        return this.isDev ? this.app.api : (`${process.env.HITCHHIKER_APP_HOST}api/` || this.app.api);
    }

    get appHost() {
        return this.isDev ? this.app.host : (process.env.HITCHHIKER_APP_HOST || this.app.host);
    }

    get appLanguage() {
        return this.isDev ? this.app.language : (process.env.HITCHHIKER_APP_LANG || this.app.language);
    }

    get appPort() {
        let port = this.getValidNum(process.env.HITCHHIKER_APP_PORT, this.appHost.substr(this.appHost.lastIndexOf(':') + 1).replace('/', ''));
        if (!(/^[0-9]*$/.test(port.toString()))) {
            port = 8080;
        }
        return this.isDev ? 81 : port;
    }

    get schedule() {
        return this._setting.schedule;
    }

    get db() {
        return this._setting.db;
    }

    get encryptPassword() {
        return this.getValidBoolean(process.env.HITCHHIKER_ENCRYPT_PASSWORD, this._setting.app.encryptPassword);
    }

    get scheduleDuration() {
        return this.getValidNum(process.env.HITCHHIKER_SCHEDULE_DURATION, this.schedule.duration);
    }

    get scheduleStoreUnit() {
        return process.env.HITCHHIKER_SCHEDULE_STORE_UNIT || this.schedule.storeUnit;
    }

    get scheduleStoreLimit() {
        return this.getValidNum(process.env.HITCHHIKER_SCHEDULE_STORE_LIMIT, this.schedule.storeLimit);
    }

    get scheduleStoreContent() {
        return process.env.HITCHHIKER_SCHEDULE_STORE_CONTENT || this.schedule.storeContent;
    }

    get schedulePageSize() {
        return this.getValidNum(process.env.HITCHHIKER_SCHEDULE_PAGESIZE, this.schedule.pageSize);
    }

    get scheduleMailOnlyForFail() {
        return this.getValidBoolean(process.env.HITCHHIKER_SCHEDULE_MAILFORFAIL, this.schedule.mailOnlyForFail);
    }

    get stressType() {
        return process.env.HITCHHIKER_STRESS_TYPE || this._setting.stress.type;
    }

    get stressMaxCount() {
        return this.getValidNum(process.env.HITCHHIKER_STRESS_COUNT, this._setting.stress.storeMaxCount);
    }

    get stressHost() {
        let host = process.env.HITCHHIKER_STRESS_HOST || this._setting.stress.stressHost;
        host = host || this.appHost.replace(/^http(s?):\/\//g, 'ws://');
        if (/:\d+/.test(host)) {
            host = host.replace(/:\d+/, `:${this.stressPort}`);
        } else {
            host = host.endsWith('/') ? `${host.substr(0, host.length - 1)}:${this.stressPort}/` : `${host}:${this.stressPort}/`;
        }

        return host;
    }

    get stressPort() {
        return this.isDev ? 11011 : (this.getValidNum(process.env.HITCHHIKER_STRESS_PORT, this._setting.stress.stressPort));
    }

    get stressUpdateInterval() {
        return this.getValidNum(process.env.HITCHHIKER_STRESS_UPDATE_INTERVAL, this._setting.stress.stressUpdateInterval);
    }

    get sync() {
        return this.getValidBoolean(process.env.HITCHHIKER_SYNC_ONOFF, this.app.sync);
    }

    get syncInterval() {
        return this.getValidNum(process.env.HITCHHIKER_SYNC_INTERVAL, this.app.syncInterval);
    }

    get defaultHeaders() {
        return process.env.HITCHHIKER_DEFAULT_HEADERS || (this._setting.app.defaultHeaders ? this._setting.app.defaultHeaders.join('\n') : '');
    }

    get safeVM() {
        return this.getValidBoolean(process.env.HITCHHIKER_SAFE_VM, this.app.safeVM);
    }

    get enableUpload() {
        return this.getValidBoolean(process.env.HITCHHIKER_ENABLE_UPLOAD, this.app.enableUpload);
    }

    get scriptTimeout() {
        return this.getValidNum(process.env.HITCHHIKER_SCRIPT_TIMEOUT, this.app.scriptTimeout);
    }

    get customMailType() {
        return process.env.HITCHHIKER_MAIL_CUSTOM_TYPE || this.mail.customType;
    }

    get customMailApi() {
        return process.env.HITCHHIKER_MAIL_API || this.mail.customApi;
    }

    get customMailSmtpHost() {
        return process.env.HITCHHIKER_MAIL_SMTP_HOST || this.mail.smtp.host;
    }

    get customMailSmtpPort() {
        return this.getValidNum(process.env.HITCHHIKER_MAIL_SMTP_PORT, this.mail.smtp.port);
    }

    get customMailSmtpTLS() {
        return this.getValidBoolean(process.env.HITCHHIKER_MAIL_SMTP_TLS, this.mail.smtp.tls);
    }

    get customMailSmtpUser() {
        return process.env.HITCHHIKER_MAIL_SMTP_USER || this.mail.smtp.user;
    }

    get customMailSmtpFrom() {
        return process.env.HITCHHIKER_MAIL_SMTP_From || this.mail.smtp.from;
    }

    get customMailSmtpNickname() {
        return process.env.HITCHHIKER_MAIL_SMTP_NICKNAME || this.mail.smtp.nickname;
    }

    get customMailSmtpPass() {
        return process.env.HITCHHIKER_MAIL_SMTP_PASS || this.mail.smtp.pass;
    }

    get customMailSmtpRejectUnauthorized() {
        return this.getValidBoolean(process.env.HITCHHIKER_MAIL_SMTP_RU, this.mail.smtp.rejectUnauthorized);
    }

    get inviteMemberDirectly() {
        return this.getValidBoolean(process.env.HITCHHIKER_APP_INVITE_DIRECTLY, this.app.inviteMemberDirectly);
    }

    get requestTimeout() {
        return this.getValidNum(process.env.HITCHHIKER_APP_SCRIPT_TIMEOUT, this.app.requestTimeout);
    }

    private getValidNum(envVar: any, spare: number) {
        return envVar === undefined ? spare : parseInt(envVar);
    }

    private getValidBoolean(envVar: any, spare: boolean) {
        return envVar === undefined ? spare : (envVar === '1' || envVar === 'true');
    }
}