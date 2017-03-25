import { User } from "../models/user";
import { ConnectionManager } from "./connection_manager";
import { Message } from "../common/message";
import { ResObject } from "../common/res_object";
import { ValidateUtil } from "../utils/validate_util";

export class UserService {
    static async checkUser(email: string, pwd: string): Promise<ResObject> {
        const user = await UserService.getUserByEmail(email, true, true);
        if (user && user.password === pwd) {//TODO: md5
            return { success: true, message: '', result: user };
        }
        return { success: false, message: Message.userCheckFailed };
    }

    static async createUser(name: string, email: string, pwd: string): Promise<ResObject> {
        let checkRst = ValidateUtil.checkEmail(email);
        if (checkRst.success) { checkRst = ValidateUtil.checkPassword(pwd); }
        if (checkRst.success) { checkRst = ValidateUtil.checkUserName(name); }
        if (!checkRst.success) {
            return checkRst;
        }

        const isEmailExist = await UserService.IsUserEmailExist(email);
        if (isEmailExist) {
            return { success: false, message: Message.userEmailRepeat };
        }

        const user = new User(name, email, pwd);
        user.save();

        return { success: true, message: Message.userCreateSuccess };
    }

    static async IsUserEmailExist(email: string): Promise<boolean> {
        const user = await UserService.getUserByEmail(email);

        return user !== undefined;
    }

    static async getUserByEmail(email: string, needTeam?: boolean, needEnv?: boolean): Promise<User> {
        const connection = await ConnectionManager.getInstance();

        let rep = await connection.getRepository(User)
            .createQueryBuilder("user")
            .where(`user.email = :email`)
            .setParameter('email', email);

        if (needTeam) { rep = rep.leftJoinAndSelect('user.teams', 'team'); };
        if (needEnv) { rep = rep.leftJoinAndSelect('user.environments', 'env'); };

        return rep.getOne();
    }

    static async getUserById(id: string, needTeam?: boolean, needEnv?: boolean): Promise<User> {
        const connection = await ConnectionManager.getInstance();

        let rep = await connection.getRepository(User)
            .createQueryBuilder("user")
            .where(`user.id = :id`)
            .setParameter('id', id);

        if (needTeam) { rep = rep.leftJoinAndSelect('user.teams', 'team'); };
        if (needEnv) { rep = rep.leftJoinAndSelect('user.environments', 'env'); };

        return rep.getOne();
    }
}