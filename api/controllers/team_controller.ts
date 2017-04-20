import { GET, POST, PUT, BodyParam, PathParam, QueryParam, BaseController } from 'webapi-router';
import { ResObject } from "../common/res_object";
import { DtoTeam } from "../interfaces/dto_team";
import { TeamService } from "../services/team_service";
import * as Koa from 'koa';
import { SessionService } from "../services/session_service";
import { UserService } from "../services/user_service";
import { Message } from "../common/message";
import { TokenService } from "../services/token_service";
import { MailService } from "../services/mail_service";
import { InviteToTeamToken } from "../common/invite_team_token";
import { User } from "../models/user";
import { Team } from "../models/team";

export default class TeamController extends BaseController {

    @POST('/team')
    async create(ctx: Koa.Context, @BodyParam info: DtoTeam): Promise<ResObject> {
        info.owner = SessionService.getUserId(ctx);
        return await TeamService.saveTeam(info);
    }

    @PUT('/team')
    async update( @BodyParam info: DtoTeam): Promise<ResObject> {
        return await TeamService.saveTeam(info);
    }

    //TODO: add relative page to display and redirect to login page is missing session
    @GET('/team/:teamid/user')
    async join(ctx: Koa.Context, @PathParam('teamid') teamId: string, @QueryParam('token') token: string): Promise<ResObject> {
        const userId = SessionService.getUserId(ctx);
        const validateRst = await this.validateInfo(userId, teamId, token);

        if (!validateRst.success) {
            return validateRst;
        }

        const data = <{ info: InviteToTeamToken, user: User, team: Team }>validateRst.result;

        if (data.user.teams.find(o => o.id === teamId)) {
            return { success: false, message: Message.alreadyInTeam };
        }

        data.user.teams.push(data.team);
        await UserService.save(data.user);

        MailService.joinTeamMail(data.info.inviterEmail, data.info.userEmail, data.team.name);

        return { success: true, message: Message.joinTeamSuccess };
    }

    @GET('/team/:teamid/reject')
    async reject(ctx: Koa.Context, @PathParam('teamid') teamId: string, @QueryParam('token') token: string) {
        const userId = SessionService.getUserId(ctx);
        const validateRst = await this.validateInfo(userId, teamId, token);

        if (!validateRst.success) {
            return validateRst;
        }

        const data = <{ info: InviteToTeamToken, user: User, team: Team }>validateRst.result;
        MailService.rejectTeamMail(data.info.inviterEmail, data.info.userEmail, data.team.name);

        return { success: true, message: Message.rejectTeamSuccess };
    }

    private async validateInfo(userId: string, teamId: string, token: string): Promise<ResObject> {
        if (!TokenService.isValidToken(token)) {
            return { success: false, message: Message.tokenInvalid };
        }

        const info = TokenService.parseToken<InviteToTeamToken>(token);
        const user = await UserService.getUserById(userId, true, true);

        if (!user) {
            return { success: false, message: Message.userNotExist };
        }

        if (user.email !== info.userEmail) {
            return { success: false, message: Message.tokenInvalid };
        }

        const team = await TeamService.getTeam(teamId);
        if (!team) {
            return { success: false, message: Message.teamNotExist };
        }

        TokenService.removeToken(token);
        return { success: true, message: '', result: { info: info, user: user, team: team } };
    }
}