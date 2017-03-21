import { ResObject } from "../models/ResObject";
import { Message } from "../common/message";

export class ValidateUtil {

    static checkEmail(email: string): ResObject {
        const pattern = '/^[^\.@]+@[^\.@]+\.[a-zA-Z]+$/';
        const matchRst = email.match(pattern).values;
        return { success: matchRst && matchRst.length > 0, message: Message.userEmailFormatError };
    }

    static checkPassword(password: string): ResObject {
        const pattern = '/^[\da-zA-Z]{6,16}$/';
        const matchRst = password.match(pattern).values;
        return { success: matchRst && matchRst.length > 0, message: Message.userPasswordFormatError };
    }
}