import { ResObject } from '../interfaces/res_object';
import { Message } from './message';

export class ValidateUtil {

    static checkEmail(email: string): ResObject {
        const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return { success: pattern.test(email), message: Message.get('userEmailFormatError') };
    }

    static checkEmails(emails: string | string[]): ResObject {
        const separator = ';';
        const emailArr = emails instanceof Array ? emails : emails.split(separator);
        if (!emailArr || emailArr.length === 0) {
            return { success: false, message: Message.get('emailsAtLeastOne') };
        }

        const invalidEmailArr = emailArr.filter(e => !ValidateUtil.checkEmail(e));
        return {
            success: invalidEmailArr.length === 0,
            message: `${Message.get('userEmailFormatError')}: ${invalidEmailArr.join(';')}`,
            result: emailArr.filter(e => ValidateUtil.checkEmail(e))
        };
    }

    static checkPassword(password: string): ResObject {
        const pattern = /^[\da-zA-Z]{6,16}$/;

        return { success: pattern.test(password), message: Message.get('userPasswordFormatError') };
    }

    static checkUserName(name: string): ResObject {
        return { success: !!name, message: Message.get('userNameFormatError') };
    }

    static isResImg(headers: { [key: string]: string | string[] }) {
        return headers && headers['content-type'] && headers['content-type'].indexOf('image/') >= 0;
    }
}