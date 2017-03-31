import * as emailjs from 'emailjs';
import { Setting } from "./setting";

export class Mail {

    private static server = emailjs.server.connect(Setting.instance.mail);

    static send(target: string, subject: string, content: string) {
        Mail.server.send({
            text: content,
            from: `${Setting.instance.mail.name}`,
            to: `${target} <${target}>`,
            subject: subject
        }, function (err, message) { console.log(err || message); });
    }
}