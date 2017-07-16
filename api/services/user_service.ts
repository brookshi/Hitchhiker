import { User } from '../models/user';
import { ConnectionManager } from './connection_manager';
import { Message } from '../common/message';
import { ResObject } from '../common/res_object';
import { ValidateUtil } from '../utils/validate_util';
import { Setting } from '../utils/setting';
import { MailService } from './mail_service';
import { StringUtil } from '../utils/string_util';
import { ProjectService } from './project_service';
import * as _ from 'lodash';
import { UserProjectService } from './user_project_service';
import { SampleService } from "./sample_service";

export class UserService {

    static create(name: string, email: string, password: string) {
        const user = new User();
        user.name = name;
        user.email = email;
        user.password = password;// TODO: md5, StringUtil.md5(password);
        user.id = StringUtil.generateUID();
        return user;
    }

    static async save(user: User) {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(User).persist(user);
    }

    static async checkUser(email: string, pwd: string): Promise<ResObject> {
        const user = await UserService.getUserByEmail(email, true);
        if (user && user.password === pwd) {// TODO: md5
            if (user.isActive) {
                const userInfo = await UserProjectService.getUserInfo(user);
                return { success: true, message: '', result: userInfo };
            } else {
                return { success: false, message: Message.accountNotActive };
            }
        }
        return { success: false, message: Message.userCheckFailed };
    }

    static async checkUserById(userId: string): Promise<ResObject> {
        const user = await UserService.getUserById(userId, false);
        return { success: !!user, message: !!user ? '' : Message.userNotExist, result: user };
    }

    static async createUser(name: string, email: string, pwd: string, isAutoGenerate: boolean = false): Promise<ResObject> {
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

        const user = UserService.create(name, email, pwd);
        user.isActive = isAutoGenerate || !Setting.instance.needRegisterMailConfirm;
        await UserService.save(user);

        if (!user.isActive) {
            MailService.registerMail(user);
        }

        const project = await ProjectService.createOwnProject(user);

        await SampleService.createSampleForUser(user, project.id);

        return { success: true, message: Message.regSuccess, result: user };
    }

    static async createUserByEmail(email: string, isAutoGenerate: boolean = false): Promise<ResObject> {
        let checkRst = ValidateUtil.checkEmail(email);
        if (!checkRst.success) {
            return checkRst;
        }

        const name = email.substr(0, email.indexOf('@'));
        const password = Setting.instance.app.defaultPassword;
        return await UserService.createUser(name, email, password, isAutoGenerate);
    }

    static async IsUserEmailExist(email: string): Promise<boolean> {
        const user = await UserService.getUserByEmail(email);

        return user !== undefined;
    }

    static async getUserByEmail(email: string, needProject?: boolean): Promise<User> {
        const connection = await ConnectionManager.getInstance();

        let rep = connection.getRepository(User)
            .createQueryBuilder('user')
            .where(`user.email = :email`)
            .setParameter('email', email);

        if (needProject) { rep = rep.leftJoinAndSelect('user.projects', 'project'); };

        const user = await rep.getOne();

        if (user && needProject) {
            user.projects = await ProjectService.getProjects(user.projects.map(t => t.id), true, false, true, true);
        }

        return user;
    }

    static async getUserById(id: string, needProject?: boolean): Promise<User> {
        const connection = await ConnectionManager.getInstance();

        const user = await connection.getRepository(User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.projects', 'project')
            .where(`user.id = :id`)
            .setParameter('id', id)
            .getOne();

        if (user && needProject) {
            user.projects = await ProjectService.getProjects(user.projects.map(t => t.id), true, false, true, true);
        }

        return user;
    }

    static async active(id: string) {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(User)
            .createQueryBuilder('user')
            .update({ isActive: true })
            .where('id=:id')
            .setParameter('id', id)
            .execute();
    }

    static async changePwd(id: string, newPwd: string): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(User)
            .createQueryBuilder('user')
            .update({ password: newPwd })
            .where('id=:id')
            .setParameter('id', id)
            .execute();
        return { success: true, message: Message.userChangePwdSuccess };
    }
}