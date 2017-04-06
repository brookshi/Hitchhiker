import { Setting } from "../utils/setting";
import { User } from "../models/user";
import { StringUtil } from "../utils/string_util";
import * as request from 'request';
import { RegToken } from "../interfaces/reg_token";

export class MailService {
    static registerMail(user: User) {
        const url = `${Setting.instance.app.host}user/regconfirm?id=${user.id}&token=${MailService.buildToken()}`;
        const mailReqUrl = `${Setting.instance.mail.host}register?target=${user.email}&name=${user.name}&url=${encodeURIComponent(url)}&lang=${Setting.instance.app.language}`;

        console.log(mailReqUrl);

        request.get(mailReqUrl, (err, res, body) => {
            if (err) {
                console.error(err);
            } else {
                console.log(body);
            }
        });
    }

    static buildToken(): string {
        const info: RegToken = { host: Setting.instance.app.host, date: new Date() };
        const text = JSON.stringify(info);
        return encodeURIComponent(StringUtil.encrypt(text));
    }
}