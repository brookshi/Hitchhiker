import { ResObject } from "../models/ResObject";
import { Message } from "../common/message";

export class ValidateUtil {

    static checkEmail(email: string): ResObject {
        const pattern = /^[^\.@]+@[^\.@]+\.[a-zA-Z]+$/;

        return { success: pattern.test(email), message: Message.userEmailFormatError };
    }

    static checkPassword(password: string): ResObject {
        const pattern = /^[\da-zA-Z]{6,16}$/;

        return { success: pattern.test(password), message: Message.userPasswordFormatError };
    }

    static checkUserName(name: string): ResObject {
        return { success: !!name, message: Message.userNameFormatError };
    }
}