import { ResObject } from '../common/res_object';
import { Message } from '../common/message';

export class ValidateUtil {

    static checkEmail(email: string): ResObject {
        const pattern = /^[^@]+@[^\.@]+\.[a-zA-Z]+$/;

        return { success: pattern.test(email), message: Message.userEmailFormatError };
    }

    static checkEmails(emails: string | string[]): ResObject {
        const separator = ';';
        const emailArr = emails instanceof Array ? emails : emails.split(separator);
        if (!emailArr || emailArr.length === 0) {
            return { success: false, message: Message.emailsAtLeastOne };
        }

        const invalidEmailArr = emailArr.filter(e => !ValidateUtil.checkEmail(e));
        return {
            success: invalidEmailArr.length === 0,
            message: `${Message.userEmailFormatError}: ${invalidEmailArr.join(';')}`,
            result: emailArr.filter(e => ValidateUtil.checkEmail(e))
        };
    }

    static checkPassword(password: string): ResObject {
        const pattern = /^[\da-zA-Z]{6,16}$/;

        return { success: pattern.test(password), message: Message.userPasswordFormatError };
    }

    static checkUserName(name: string): ResObject {
        return { success: !!name, message: Message.userNameFormatError };
    }
}