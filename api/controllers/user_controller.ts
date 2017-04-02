import { GET, POST, BodyParam, BaseController } from 'webapi-router';
import { ResObject } from "../common/res_object";
import { UserService } from "../services/user_service";
import * as Koa from 'koa';
import { User } from "../models/user";
import { DtoUser } from "../interfaces/dto_user";
import { DtoTeamQuit } from "../interfaces/dto_team_quit";
import { UserTeamService } from "../services/user_team_service";
import { Mail } from "../utils/mail";
import { SessionService } from "../services/session_service";

export default class UserController extends BaseController {

    @POST('/user')
    async register( @BodyParam body: DtoUser): Promise<ResObject> {
        Mail.send('iwxiaot@gmail.com', 'test', 'test');
        return await UserService.createUser(body.name, body.email, body.password);
    }

    @POST()
    async login(ctx: Koa.Context, @BodyParam body: DtoUser): Promise<ResObject> {
        let checkLogin = await UserService.checkUser(body.email, body.password);
        if (!checkLogin.success) {
            return checkLogin;
        }

        SessionService.login(ctx, (<User>checkLogin.result).id);

        (<User>checkLogin.result).password = undefined;

        return checkLogin;
    }

    @GET()
    logout(ctx: Koa.Context): ResObject {
        SessionService.logout(ctx);
        return { success: true, message: '' };
    }

    @POST('/user/quitteam')
    async quitTeam( @BodyParam info: DtoTeamQuit): Promise<ResObject> {
        return await UserTeamService.quitTeam(info);
    }
}