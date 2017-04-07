import { Setting } from "../utils/setting";
import { User } from "../models/user";
import { StringUtil } from "../utils/string_util";
import * as request from 'request';
import { RegToken } from "../interfaces/reg_token";

export class MailService {
    static registerMail(user: User) {
        const url = `${Setting.instance.app.host}user/regconfirm?id=${user.id}&token=${MailService.buildToken()}`;
        const mailReqUrl = `${Setting.instance.mail.host}register?target=${user.email}&name=${user.name}&url=${encodeURIComponent(url)}&lang=${Setting.instance.app.language}`;

        request.get(mailReqUrl, (err, res, body) => {
            if (err) {
                console.error(err);
            } else {
                console.log(body);
            }
        });
    }

    static inviterMail(target: string, inviter: User): Promise<{ err: any, body: any }> {
        const url = `${Setting.instance.app.host}index`;
        const mailReqUrl = `${Setting.instance.mail.host}register?target=${target}&inviter=<${inviter.name}>${inviter.email}&url=${encodeURIComponent(url)}&lang=${Setting.instance.app.language}`;

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

    private static buildToken(): string {
        const info: RegToken = { host: Setting.instance.app.host, date: new Date() };
        const text = JSON.stringify(info);
        return encodeURIComponent(StringUtil.encrypt(text));
    }
}