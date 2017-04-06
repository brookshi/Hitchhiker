import { Setting } from "../utils/setting";
import { User } from "../models/user";
import { StringUtil } from "../utils/string_util";
import * as request from 'request';
import { RegToken } from "../interfaces/reg_token";

export class MailService {
    static registerMail(user: User) {
        const host = Setting.instance.mail.host;
        const url = `${host}user/regconfirm?id=${user.id}&token=${MailService.buildToken()}`;
        const mailReqUrl = `${host}register?target=${user.email}&name=${user.name}&url=${url}&lang=${Setting.instance.app.language}`;

        request.get(mailReqUrl);
    }

    static buildToken(): string {
        const info: RegToken = { host: Setting.instance.mail.host, date: new Date() };
        const text = JSON.stringify(info);
        return StringUtil.encrypt(text);
    }
}