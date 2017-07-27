import { Setting } from '../utils/setting';
import { User } from '../models/user';
import * as request from 'request';
import { Project } from '../models/project';
import { TokenService } from './token_service';
import { Log } from '../utils/log';

export class MailService {
    static registerMail(user: User) {
        const url = `${Setting.instance.appApi}user/regconfirm?id=${user.id}&token=${TokenService.buildRegToken()}`;
        const mailReqUrl = `${Setting.instance.mail.host}register?target=${user.email}&name=${user.name}&url=${encodeURIComponent(url)}&lang=${Setting.instance.appLanguage}`;

        MailService.sendMail(mailReqUrl);
    }

    static async inviterMail(target: string, inviter: User): Promise<{ err: any, body: any }> {
        const url = `${Setting.instance.appHost}`;
        const mailReqUrl = `${Setting.instance.mail.host}invite?target=${target}&inviter=${inviter.name}&inviteremail=${inviter.email}&url=${encodeURIComponent(url)}&lang=${Setting.instance.appLanguage}`;

        return await MailService.sendMail(mailReqUrl);
    }

    static async projectInviterMail(targetEmail: string, inviter: User, project: Project): Promise<{ err: any, body: any }> {
        const token = TokenService.buildInviteToProjectToken(targetEmail, project.id, inviter.id, inviter.email);
        const acceptUrl = `${Setting.instance.appApi}project/join?token=${token}&projectid=${project.id}`;
        const rejectUrl = `${Setting.instance.appApi}project/reject?token=${token}&projectid=${project.id}`;

        const mailReqUrl = `${Setting.instance.mail.host}inviteToProject?target=${targetEmail}&inviter=${inviter.name}&inviteremail=${inviter.email}&project=${project.name}&accept=${encodeURIComponent(acceptUrl)}&reject=${encodeURIComponent(rejectUrl)}&lang=${Setting.instance.appLanguage}`;

        return await MailService.sendMail(mailReqUrl);
    }

    static rejectProjectMail(inviterEmail: string, userEmail: string, project: string) {
        const mailReqUrl = `${Setting.instance.mail.host}rejectinvite?target=${inviterEmail}&useremail=${userEmail}&project=${project}&lang=${Setting.instance.appLanguage}`;
        MailService.sendMail(mailReqUrl);
    }

    static joinProjectMail(inviterEmail: string, userEmail: string, project: string) {
        const joinProjectMailUrl = `${Setting.instance.mail.host}acceptinvite?target=${inviterEmail}&useremail=${userEmail}}&project=${project}&lang=${Setting.instance.appLanguage}`;
        const userInfoMailUrl = `${Setting.instance.mail.host}join?target=${userEmail}&password=${Setting.instance.app.defaultPassword}}&project=${project}&lang=${Setting.instance.appLanguage}`;
        MailService.sendMail(joinProjectMailUrl);
        MailService.sendMail(userInfoMailUrl);
    }

    static async findPwdMail(target: string, pwd: string): Promise<{ err: any, body: any }> {
        const mailReqUrl = `${Setting.instance.mail.host}findpwd?target=${target}&pwd=${pwd}&lang=${Setting.instance.appLanguage}`;
        return await MailService.sendMail(mailReqUrl);
    }

    static async scheduleMail(targets: string[], body: any) {
        const mailReqUrl = `${Setting.instance.mail.host}schedule?targets=${targets.join(';')}&lang=${Setting.instance.appLanguage}`;
        return await MailService.postMail(mailReqUrl, body);
    }

    private static sendMail(url: string): Promise<{ err: any, body: any }> {
        return MailService.request({ url, headers: { 'content-type': 'application/json' }, method: 'get' });
    }

    private static postMail(url: string, body: any): Promise<any> {
        return MailService.request({ url, body: JSON.stringify(body), headers: { 'content-type': 'application/json' }, method: 'post' });
    }

    private static request(option: request.Options): Promise<any> {
        return new Promise<{ err: any, response: request.RequestResponse, body: any }>((resolve, reject) => {
            request(option, (err, response, body) => {
                resolve({ err, response, body });
                if (err) {
                    Log.error(err);
                } else {
                    Log.info(body);
                }
            });
        });
    }
}