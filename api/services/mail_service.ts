import { Setting } from "../utils/setting";
import { User } from "../models/user";
import * as request from 'request';
import { Team } from "../models/team";
import { TokenService } from "./token_service";

export class MailService {
    static registerMail(user: User) {
        const url = `${Setting.instance.app.host}user/regconfirm?id=${user.id}&token=${TokenService.buildRegToken()}`;
        const mailReqUrl = `${Setting.instance.mail.host}register?target=${user.email}&name=${user.name}&url=${encodeURIComponent(url)}&lang=${Setting.instance.app.language}`;

        MailService.sendMail(mailReqUrl);
    }

    static async inviterMail(target: string, inviter: User): Promise<{ err: any, body: any }> {
        const url = `${Setting.instance.app.host}index`; // TODO: invite to main page
        const mailReqUrl = `${Setting.instance.mail.host}invite?target=${target}&inviter=${inviter.name}&inviteremail=${inviter.email}&url=${encodeURIComponent(url)}&lang=${Setting.instance.app.language}`;

        return await MailService.sendMail(mailReqUrl);
    }

    static async teamInviterMail(targetEmail: string, inviter: User, team: Team): Promise<{ err: any, body: any }> {
        const token = TokenService.buildInviteToTeamToken(targetEmail, inviter.id, inviter.email);
        const acceptUrl = `${Setting.instance.app.host}team/${team.id}/user?token=${token}`; //TODO: accept url page
        const rejectUrl = `${Setting.instance.app.host}team/${team.id}/reject?token=${token}`; // TODO: reject url page

        const mailReqUrl = `${Setting.instance.mail.host}inviteToTeam?target=${targetEmail}&inviter=${inviter.name}&inviteremail=${inviter.email}&team=${team.name}&accept=${encodeURIComponent(acceptUrl)}&reject=${encodeURIComponent(rejectUrl)}&lang=${Setting.instance.app.language}`;

        return await MailService.sendMail(mailReqUrl);
    }

    static async rejectTeamMail(inviterEmail: string, userEmail: string, team: string) {
        const mailReqUrl = `${Setting.instance.mail.host}rejectinvite?target=${inviterEmail}&useremail=${userEmail}&team=${team}&lang=${Setting.instance.app.language}`;
        MailService.sendMail(mailReqUrl);
    }

    static async joinTeamMail(inviterEmail: string, userEmail: string, team: string) {
        const mailReqUrl = `${Setting.instance.mail.host}acceptinvite?target=${inviterEmail}&useremail=${userEmail}}&team=${team}&lang=${Setting.instance.app.language}`;
        MailService.sendMail(mailReqUrl);
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