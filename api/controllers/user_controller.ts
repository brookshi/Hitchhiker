import { POST, BodyParam, BaseController } from 'webapi-router';
import { ResObject } from "../common/res_object";
import { UserService } from "../services/user_service";
import * as Koa from 'koa';
import { User } from "../models/user";
import { DtoUser } from "../interfaces/dto_user";
import { DtoTeamQuit } from "../interfaces/dto_team_quit";
import { UserTeamService } from "../services/user_team_service";

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

        (<any>ctx).sessionHandler.regenerateId();
        (<any>ctx).session = checkLogin.result;

        (<User>checkLogin.result).password = undefined;

        return checkLogin;
    }

    @POST('/user/quitteam')
    async quitTeam( @BodyParam info: DtoTeamQuit): Promise<ResObject> {
        return await UserTeamService.quitTeam(info);
    }
}