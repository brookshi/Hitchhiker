import { TemplateSetting } from './template_setting';
import * as request from 'request';
import * as uuid from 'uuid';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as path from 'path';
import { MailScheduleRecord, MailRunResult } from '../interfaces/dto_mail';
import { Setting } from '../utils/setting';
import { Log } from '../utils/log';
import * as nodeMailer from 'nodemailer';

export class Mail {

    static async sendForRegister(target: string, name: string, url: string, lang: string): Promise<any> {
        const type = 'register';
        const title = TemplateSetting.instance.templates[type].title[lang];
        let content = Mail.getContent(type, lang);
        const userName = name || target.substr(0, target.indexOf('@'));
        content = content.replace(/\{\{name\}\}/g, userName).replace(/\{\{url\}\}/g, url);
        return Mail.send(target, title, content);
    }

    static async sendForInviteToProject(target: string, inviter: string, project: string, accept: string, reject: string, lang: string): Promise<{ err: any, body: any }> {
        const type = 'inviteToProject';
        const title = TemplateSetting.instance.templates[type].title[lang]
            .replace(/\{\{inviter\}\}/g, inviter)
            .replace(/\{\{project\}\}/g, project);

        let content = Mail.getContent(type, lang);
        content = content.replace(/\{\{inviter\}\}/g, inviter)
            .replace(/\{\{project\}\}/g, project)
            .replace(/\{\{accept\}\}/g, accept)
            .replace(/\{\{reject\}\}/g, reject);

        return await Mail.send(target, title, content);
    }

    static async sendForInvite(target: string, inviter: string, url: string, lang: string): Promise<{ err: any, body: any }> {
        const type = 'invite';
        const title = TemplateSetting.instance.templates[type].title[lang]
            .replace(/\{\{inviter\}\}/g, inviter);
        let content = Mail.getContent(type, lang);
        content = content.replace(/\{\{inviter\}\}/g, inviter).replace(/\{\{url\}\}/g, url);
        return await Mail.send(target, title, content);
    }

    static sendForAcceptInvitation(target: string, user: string, project: string, lang: string): Promise<any> {
        const type = 'acceptInvitation';
        const title = TemplateSetting.instance.templates[type].title[lang].replace(/\{\{user\}\}/g, user).replace(/\{\{project\}\}/g, project);
        let content = Mail.getContent(type, lang).replace(/\{\{user\}\}/g, user).replace(/\{\{project\}\}/g, project);
        return Mail.send(target, title, content);
    }

    static async sendForRejectInvitation(target: string, user: string, project: string, lang: string): Promise<any> {
        const type = 'rejectInvitation';
        const title = TemplateSetting.instance.templates[type].title[lang].replace(/\{\{user\}\}/g, user).replace(/\{\{project\}\}/g, project);
        let content = Mail.getContent(type, lang).replace(/\{\{user\}\}/g, user).replace(/\{\{project\}\}/g, project);
        return Mail.send(target, title, content);
    }

    static async sendForFindPwd(target: string, pwd: string, lang: string): Promise<{ err: any, body: any }> {
        const type = 'findPwd';
        const title = TemplateSetting.instance.templates[type].title[lang];
        let content = Mail.getContent(type, lang).replace(/\{\{pwd\}\}/g, pwd);
        return await Mail.send(target, title, content);
    }

    static sendUserInfo(target: string, pwd: string, project: string, lang: string): Promise<any> {
        const type = 'userInfo';
        const title = TemplateSetting.instance.templates[type].title[lang];
        let content = Mail.getContent(type, lang).replace(/\{\{project\}\}/g, project).replace(/\{\{password\}\}/g, pwd);
        return Mail.send(target, title, content);
    }

    static async sendForSchedule(target: string, lang: string, record: MailScheduleRecord): Promise<{ err: any, body: any }> {
        const type = record.success ? 'scheduleSuccess' : 'scheduleFailed';
        const title = TemplateSetting.instance.templates[type].title[lang].replace(/\{\{scheduleName\}\}/g, record.scheduleName);
        const content = Mail.getContent(type, lang).replace(/\{\{schedule\}\}/g, record.scheduleName).replace(/\{\{detail\}\}/g, Mail.getScheduleDetail(record));
        return await Mail.send(target, title, content);
    }

    static getScheduleDetail(record: MailScheduleRecord): string {
        if (record.runResults.length === 0) {
            return '';
        }
        const rows = record.runResults.map(r => `<tr><td>${r.recordName}</td><td>${r.envName}</td><td>${r.isSuccess}</td><td>${(r.duration / 1000) + 's'}</td><td>${Mail.getRunResultTestDesc(r)}</td><td>${r.error ? r.error.message : ''}</td></tr>`);
        return `<table style="margin-top: 8px;" Width="100%"><tr style="line-height: 40px; background-color: #EEE"><td>Name</td><td>Environment</td><td>Success</td><td>Duration</td><td>Tests</td><td>Error</td></tr>${rows.join('')}</table>`;
    }

    static getRunResultTestDesc(runResult: MailRunResult): string {
        return `<pre>${_.keys(runResult.tests).map(k =>
            `<div>${k}: <span Style=${runResult.tests[k] ? 'color: green' : 'color: red'}>${runResult.tests[k] ? 'PASS' : 'FAIL'}</span></div>`)}
            </pre>`;
    }

    private static send(target: string, subject: string, content: string): Promise<any> {
        if (Setting.instance.customMailType === 'api') {
            return Mail.sendWithApi(target, subject, content);
        } else {
            return Mail.sendWithSmtp(target, subject, content);
        }
    }

    private static sendWithApi(target: string, subject: string, content: string): Promise<any> {
        return new Promise<{ err: any, response: request.RequestResponse, body: any }>((resolve, reject) => {
            request({ method: 'post', url: Setting.instance.customMailApi, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ target, subject, content }) }, (err, response, body) => {
                resolve({ err, response, body });
                if (err) {
                    Log.error(err);
                } else {
                    Log.info('mail send success');
                }
            });
        });
    }

    private static getContent(type: string, lang: string): string {

        const file = path.join(__dirname, `./templates/${TemplateSetting.instance.templates[type].template[lang]}`);
        if (!fs.existsSync(file)) {
            console.error(`${file} does not exist`);
        }
        return fs.readFileSync(file, 'utf-8');
    }

    private static encode(str: string): string {
        return encodeURIComponent(str).replace(/[!'()*]/g, c => {
            return '%' + c.charCodeAt(0).toString(16);
        });
    }

    static transporter = nodeMailer.createTransport({
        pool: true,
        host: Setting.instance.customMailSmtpHost,
        port: Setting.instance.customMailSmtpPort,
        secure: Setting.instance.customMailSmtpTLS,
        auth: {
            user: Setting.instance.customMailSmtpUser,
            pass: Setting.instance.customMailSmtpPass
        },
        tls: {
            rejectUnauthorized: Setting.instance.customMailSmtpRejectUnauthorized
        }
    });

    private static async sendWithSmtp(target: string, subject: string, content: string): Promise<any> {
        const from = Setting.instance.customMailSmtpFrom || Setting.instance.customMailSmtpUser;
        const mailOptions = {
            from: Setting.instance.customMailSmtpNickname ? `"${Setting.instance.customMailSmtpNickname}" <${from}>` : from,
            to: target.replace(';', ','),
            subject,
            html: content
        };
        return new Promise((resolve, reject) => Mail.transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                Log.error(`mail: ${err.message}`);
                reject(err);
            } else {
                Log.info('mail: send mail success');
                resolve();
            }
        }));
    }
}