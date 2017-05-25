import { GET, POST, PUT, DELETE, BodyParam, PathParam, QueryParam, BaseController } from 'webapi-router';
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
import { UserTeamService } from "../services/user_team_service";
import { ValidateUtil } from "../utils/validate_util";
import * as _ from "lodash";

export default class TeamController extends BaseController {

    @POST('/team')
    async create(ctx: Koa.Context, @BodyParam info: DtoTeam): Promise<ResObject> {
        return await TeamService.createTeam(info, SessionService.getUserId(ctx));
    }

    @PUT('/team')
    async update( @BodyParam info: DtoTeam): Promise<ResObject> {
        return await TeamService.updateTeam(info);
    }

    @DELETE('/team/:tid/own')
    async quitTeam(ctx: Koa.Context, @PathParam('tid') teamId: string): Promise<ResObject> {
        return await UserTeamService.quitTeam({ userId: SessionService.getUserId(ctx), teamId });
    }

    @DELETE('/team/:tid/user/:uid')
    async removeUser(ctx: Koa.Context, @PathParam('tid') teamId: string, @PathParam('uid') userId: string): Promise<ResObject> {
        return await UserTeamService.quitTeam({ userId, teamId });
    }

    @DELETE('/team/:tid')
    async disbandTeam(ctx: Koa.Context, @PathParam('tid') teamId: string): Promise<ResObject> {
        const userId = SessionService.getUserId(ctx);
        return UserTeamService.disbandTeam({ userId, teamId });
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
        const user = await UserService.getUserById(userId, true);

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

    @POST('/team/:tid')
    async inviteToTeam(ctx: Koa.Context, @PathParam('tid') teamId: string, @BodyParam emailInfo: { emails: string[] }): Promise<ResObject> {
        const checkEmailsRst = ValidateUtil.checkEmails(emailInfo.emails);
        if (!checkEmailsRst.success) {
            return checkEmailsRst;
        }
        let emailArr = <Array<string>>checkEmailsRst.result;

        const team = await TeamService.getTeam(teamId, false, true);

        if (!team) {
            return { success: false, message: Message.teamNotExist };
        }

        emailArr = _.difference(emailArr, team.members.map(t => t.email));
        if (emailArr.length === 0) {
            return { success: false, message: Message.emailsAllInTeam };
        }

        const user = (<any>ctx).session.user;
        const results = await Promise.all(emailArr.map(email => MailService.teamInviterMail(email, user, team)));
        const success = results.every(rst => !rst.err);

        if (success) { //TODO: add in transaction is the better way
            await Promise.all(emailArr.map(email => UserService.createUserByEmail(email)));
        }

        return { success: success, message: results.map(rst => rst.err).join(';') };
    }
}