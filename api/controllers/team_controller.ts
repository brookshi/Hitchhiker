import { POST, PUT, BodyParam, BaseController } from 'webapi-router';
import { ResObject } from "../common/res_object";
import { DtoTeam } from "../interfaces/dto_team";
import { TeamService } from "../services/team_service";
import * as Koa from 'koa';
import { User } from "../models/user";

export default class TeamController extends BaseController {

    @POST('/team')
    async create(ctx: Koa.Context, @BodyParam info: DtoTeam): Promise<ResObject> {
        const user = <User>(<any>ctx).session.user;
        info.owner = user.id;
        return await TeamService.saveTeam(info);
    }

    @PUT('/team')
    async update( @BodyParam info: DtoTeam): Promise<ResObject> {
        return await TeamService.saveTeam(info);
    }
}