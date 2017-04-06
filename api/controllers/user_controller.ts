import { GET, POST, QueryParam, BodyParam, BaseController } from 'webapi-router';
import { ResObject } from "../common/res_object";
import { UserService } from "../services/user_service";
import * as Koa from 'koa';
import { User } from "../models/user";
import { DtoUser } from "../interfaces/dto_user";
import { DtoTeamQuit } from "../interfaces/dto_team_quit";
import { UserTeamService } from "../services/user_team_service";
import { SessionService } from "../services/session_service";
import { Message } from "../common/message";
import { RegToken } from "../interfaces/reg_token";
import { DateUtil } from "../utils/date_util";
import { Setting } from "../utils/setting";

export default class UserController extends BaseController {

    @POST('/user')
    async register( @BodyParam body: DtoUser): Promise<ResObject> {
        return await UserService.createUser(body.name, body.email, body.password);
    }

    @POST()
    async login(ctx: Koa.Context, @BodyParam body: DtoUser): Promise<ResObject> {
        let checkLogin = await UserService.checkUser(body.email, body.password);
        if (!checkLogin.success) {
            return checkLogin;
        }

        SessionService.login(ctx, (<User>checkLogin.result).id);

        checkLogin.message = Message.userLoginSuccess;
        (<User>checkLogin.result).password = undefined;

        return checkLogin;
    }

    @GET()
    logout(ctx: Koa.Context): ResObject {
        SessionService.logout(ctx);
        return { success: true, message: Message.userLogout };
    }

    @POST('/user/quitteam')
    async quitTeam( @BodyParam info: DtoTeamQuit): Promise<ResObject> {
        return await UserTeamService.quitTeam(info);
    }

    @GET('/user/regconfirm')
    async regConfirm( @QueryParam('id') id: string, @QueryParam('token') token: string): Promise<ResObject> {
        const user = await UserService.getUserById(id);
        if (!user) {
            return { success: false, message: Message.regConfireFailed_userNotExist };
        }

        if (user.isActive) {
            return { success: false, message: Message.regConfireFailed_userConfirmed };
        }

        const info = <RegToken>JSON.parse(token);
        if (!info || info.host !== Setting.instance.app.host) {
            return { success: false, message: Message.regConfireFailed_invalid };
        }

        if (DateUtil.diff(info.date, new Date()) > 24) {
            return { success: false, message: Message.regConfireFailed_expired };
        }

        UserService.active(user.id);

        return { success: true, message: Message.regConfirmSuccess };
    }
}