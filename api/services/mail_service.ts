import { Setting } from "../utils/setting";
import { User } from "../models/user";
import { StringUtil } from "../utils/string_util";
import * as request from 'request';
import { RegToken } from "../common/reg_token";
import { InviteToTeamToken } from "../common/invite_team_token";
import { Team } from "../models/team";

export class MailService {
    static registerMail(user: User) {
        const url = `${Setting.instance.app.host}user/regconfirm?id=${user.id}&token=${MailService.buildRegToken()}`;
        const mailReqUrl = `${Setting.instance.mail.host}register?target=${user.email}&name=${user.name}&url=${encodeURIComponent(url)}&lang=${Setting.instance.app.language}`;

        request.get(mailReqUrl, (err, res, body) => {
            if (err) {
                console.error(err);
            } else {
                console.log(body);
            }
        });
    }

    static async inviterMail(target: string, inviter: User): Promise<{ err: any, body: any }> {
        const url = `${Setting.instance.app.host}index`;
        const mailReqUrl = `${Setting.instance.mail.host}invite?target=${target}&inviter=<${inviter.name}>${inviter.email}&url=${encodeURIComponent(url)}&lang=${Setting.instance.app.language}`;

        return new Promise<{ err: any, body: any }>((resolve, reject) => {
            request.get(mailReqUrl, (err, res, body) => {
                resolve({ err, body });
                if (err) {
                    console.error(err);
                } else {
                    console.log(body);
                }
            });
        });
    }

    static async teamInviterMail(target: User, inviter: User, team: Team): Promise<{ err: any, body: any }> {
        const token = MailService.buildInviteToTeamToken(target.id);
        const acceptUrl = `${Setting.instance.app.host}team/${team.id}/user?token=${token}`;
        const rejectUrl = `${Setting.instance.app.host}team/${team.id}/reject?token=${token}`;

        const mailReqUrl = `${Setting.instance.mail.host}inviteToTeam?target=${target}&inviter=<${inviter.name}>${inviter.email}&team=${team.name}&accept=${encodeURIComponent(acceptUrl)}&reject=${encodeURIComponent(rejectUrl)}&lang=${Setting.instance.app.language}`;

        return await MailService.sendMail(mailReqUrl);
    }

    private static sendMail(url: string): Promise<{ err: any, body: any }> {
        return new Promise<{ err: any, body: any }>((resolve, reject) => {
            request.get(url, (err, res, body) => {
                resolve({ err, body });
                if (err) {
                    console.error(err);
                } else {
                    console.log(body);
                }
            });
        });
    }
}