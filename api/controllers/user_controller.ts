import { GET, POST, PUT, DELETE, QueryParam, BodyParam, PathParam, BaseController } from 'webapi-router';
import { ResObject } from '../common/res_object';
import { UserService } from '../services/user_service';
import * as Koa from 'koa';
import { User } from '../models/user';
import { DtoUser } from '../interfaces/dto_user';
import { SessionService } from '../services/session_service';
import { Message } from '../common/message';
import { RegToken } from '../common/reg_token';
import { DateUtil } from '../utils/date_util';
import { Setting } from '../utils/setting';
import { StringUtil } from '../utils/string_util';
import { MailService } from '../services/mail_service';
import { ValidateUtil } from '../utils/validate_util';
import * as _ from 'lodash';
import { Password } from '../interfaces/password';

export default class UserController extends BaseController {

    @POST('/user')
    async register( @BodyParam body: DtoUser): Promise<ResObject> {
        return await UserService.createUser(body.name, body.email, body.password);
    }

    @POST('/user/temp')
    async tempUse(ctx: Koa.Context): Promise<ResObject> {
        const name = 'test';
        const password = Setting.instance.app.defaultPassword;
        const email = `${StringUtil.generateShortId()}${Setting.instance.app.tempUser}`;
        await UserService.createUser(name, email, password, true, true);
        return await this.login(ctx, { id: '', email, password, name })
    }

    @DELETE('/user/temp')
    async deleteTempUser( @QueryParam('key') key: string) {
        if (key !== Setting.instance.app.tempDelKey) {
            return;
        }

        await UserService.deleteTempUser();
    }

    @POST()
    async login(ctx: Koa.Context, @BodyParam body: DtoUser): Promise<ResObject> {
        let checkLogin = await UserService.checkUser(body.email, body.password);
        if (!checkLogin.success) {
            return checkLogin;
        }

        SessionService.login(ctx, (<User>checkLogin.result.user).id);

        checkLogin.message = Message.userLoginSuccess;
        (<User>checkLogin.result.user).password = undefined;

        return checkLogin;
    }

    @GET('/user/me')
    async getUserInfo(ctx: Koa.Context): Promise<ResObject> {
        const user = <User>(<any>ctx).session.user;
        return await this.login(ctx, user);
    }

    @GET('/user/logout')
    logout(ctx: Koa.Context): ResObject {
        SessionService.logout(ctx);
        return { success: true, message: Message.userLogout };
    }

    @PUT('/user/password')
    async changePwd(ctx: Koa.Context, @BodyParam info: Password): Promise<ResObject> {
        const checkRst = ValidateUtil.checkPassword(info.newPassword);
        if (!checkRst.success) {
            return checkRst;
        }

        const user = <User>(<any>ctx).session.user;
        if (user.password !== info.oldPassword) {// TODO: md5
            return { success: false, message: Message.userOldPwdIncorrect };
        }

        return await UserService.changePwd(user.id, info.newPassword);
    }

    @GET('/user/findpwd')
    async findPwd( @QueryParam('email') email: string): Promise<ResObject> {
        let checkRst = ValidateUtil.checkEmail(email);
        if (!checkRst.success) {
            return checkRst;
        }

        const user = await UserService.getUserByEmail(email);
        if (!user) {
            return { success: false, message: Message.userNotExist };
        }

        const newPwd = StringUtil.generateShortId();
        checkRst = await UserService.changePwd(user.id, newPwd);
        if (!checkRst.success) {
            return checkRst;
        }

        const mailRst = await MailService.findPwdMail(email, newPwd);
        const success = !mailRst.err;

        return { success: success, message: success ? Message.findPwdSuccess : `send new password email failed: ${mailRst.err.toString()}` };
    }

    @GET('/user/regconfirm')
    async regConfirm(ctx: Koa.Context, @QueryParam('id') id: string, @QueryParam('token') token: string): Promise<string> {
        const user = await UserService.getUserById(id);
        if (!user) {
            return Message.regConfirmFailedUserNotExist;
        }

        if (user.isActive) {
            return Message.regConfirmFailedUserConfirmed;
        }

        const json = StringUtil.decrypt(token);
        const info = <RegToken>JSON.parse(json);

        if (!info || info.host !== Setting.instance.appHost) {
            return Message.regConfirmFailedInvalid;
        }

        if (DateUtil.diff(new Date(info.date), new Date()) > 24) {
            return Message.regConfirmFailedExpired;
        }

        UserService.active(user.id);

        ctx.body = Message.regConfirmSuccess;
        ctx.redirect(Setting.instance.appHost);
    }

    @GET('/user/invite/:emails')
    async invite(ctx: Koa.Context, @PathParam('emails') emails: string): Promise<ResObject> {
        const checkEmailsRst = ValidateUtil.checkEmails(emails);
        if (!checkEmailsRst.success) {
            return checkEmailsRst;
        }

        const emailArr = <Array<string>>checkEmailsRst.result;
        const user = (<any>ctx).session.user;
        const results = await Promise.all(emailArr.map(email => MailService.inviterMail(email, user)));

        return { success: results.every(rst => !rst.err), message: results.map(rst => rst.err).join(';') };
    }
}