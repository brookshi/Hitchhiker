import { GET, POST, PUT, DELETE, BodyParam, PathParam, QueryParam, BaseController } from 'webapi-router';
import { ResObject } from '../common/res_object';
import { DtoProject } from '../interfaces/dto_project';
import { ProjectService } from '../services/project_service';
import * as Koa from 'koa';
import { SessionService } from '../services/session_service';
import { UserService } from '../services/user_service';
import { Message } from '../common/message';
import { TokenService } from '../services/token_service';
import { MailService } from '../services/mail_service';
import { InviteToProjectToken } from '../common/invite_project_token';
import { User } from '../models/user';
import { Project } from '../models/project';
import { UserProjectService } from '../services/user_project_service';
import { ValidateUtil } from '../utils/validate_util';
import * as _ from 'lodash';
import { Setting } from '../utils/setting';
import { ProjectFolderType } from '../common/string_type';
import * as multer from 'koa-multer';
import * as path from 'path';
import { ProjectDataService } from '../services/project_data_service';

export default class ProjectController extends BaseController {

    @POST('/project')
    async create(ctx: Koa.Context, @BodyParam info: DtoProject): Promise<ResObject> {
        return await ProjectService.createProject(info, SessionService.getUserId(ctx));
    }

    @PUT('/project')
    async update( @BodyParam info: DtoProject): Promise<ResObject> {
        return await ProjectService.updateProject(info);
    }

    @DELETE('/project/:tid/own')
    async quitProject(ctx: Koa.Context, @PathParam('tid') projectId: string): Promise<ResObject> {
        return await UserProjectService.quitProject({ userId: SessionService.getUserId(ctx), projectId });
    }

    @DELETE('/project/:tid/user/:uid')
    async removeUser(ctx: Koa.Context, @PathParam('tid') projectId: string, @PathParam('uid') userId: string): Promise<ResObject> {
        return await UserProjectService.quitProject({ userId, projectId });
    }

    @DELETE('/project/:tid')
    async disbandProject(ctx: Koa.Context, @PathParam('tid') projectId: string): Promise<ResObject> {
        const userId = SessionService.getUserId(ctx);
        return await UserProjectService.disbandProject({ userId, projectId });
    }

    @POST('/project/:pid/localhost/:id/ip/:ip')
    async addLocalhost(ctx: Koa.Context, @PathParam('id') id: string, @PathParam('pid') projectId: string, @PathParam('ip') ip: string) {
        const userId = SessionService.getUserId(ctx);
        return await ProjectService.createLocalhostMapping(id, userId, projectId, ip);
    }

    @PUT('/project/:pid/localhost/:id/ip/:ip')
    async updateLocalhost( @PathParam('id') id: string, @PathParam('ip') ip: string) {
        return await ProjectService.updateLocalhostMapping(id, ip);
    }

    @GET('/project/join')
    async join(ctx: Koa.Context, @QueryParam('projectid') projectId: string, @QueryParam('token') token: string) {
        const validateRst = await this.validateInfo(projectId, token);

        if (!validateRst.success) {
            return validateRst.message;
        }

        const data = <{ info: InviteToProjectToken, user: User, project: Project }>validateRst.result;

        if (data.user.projects.find(o => o.id === projectId)) {
            return Message.alreadyInProject;
        }

        data.user.projects.push(data.project);
        await UserService.save(data.user);

        MailService.joinProjectMail(data.info.inviterEmail, data.info.userEmail, data.project.name);

        ctx.redirect(Setting.instance.appHost);
    }

    @GET('/project/reject')
    async reject( @QueryParam('projectid') projectId: string, @QueryParam('token') token: string) {
        const validateRst = await this.validateInfo(projectId, token);

        if (!validateRst.success) {
            return validateRst;
        }

        const data = <{ info: InviteToProjectToken, user: User, project: Project }>validateRst.result;
        MailService.rejectProjectMail(data.info.inviterEmail, data.info.userEmail, data.project.name);

        return Message.rejectProjectSuccess;
    }

    private async validateInfo(projectId: string, token: string): Promise<ResObject> {
        if (!TokenService.isValidToken(token)) {
            return { success: false, message: Message.tokenInvalid };
        }

        const info = TokenService.parseToken<InviteToProjectToken>(token);

        if (projectId !== info.projectId) {
            return { success: false, message: Message.tokenInvalid };
        }

        const project = await ProjectService.getProject(projectId);

        if (!project) {
            return { success: false, message: Message.projectNotExist };
        }

        TokenService.removeToken(token);

        const user = await UserService.getUserByEmail(info.userEmail, true);
        const userRst = user || (await UserService.createUserByEmail(info.userEmail, true)).result;

        return { success: true, message: '', result: { info: info, user: userRst, project: project } };
    }

    @POST('/project/:tid')
    async inviteToProject(ctx: Koa.Context, @PathParam('tid') projectId: string, @BodyParam emailInfo: { emails: string[] }): Promise<ResObject> {
        const checkEmailsRst = ValidateUtil.checkEmails(emailInfo.emails);
        if (!checkEmailsRst.success) {
            return checkEmailsRst;
        }
        let emailArr = <Array<string>>checkEmailsRst.result;

        const project = await ProjectService.getProject(projectId, false, true);

        if (!project) {
            return { success: false, message: Message.projectNotExist };
        }

        emailArr = _.difference(emailArr, project.members.map(t => t.email));
        if (emailArr.length === 0) {
            return { success: false, message: Message.emailsAllInProject };
        }

        const user = (<any>ctx).session.user;
        const results = await Promise.all(emailArr.map(email => MailService.projectInviterMail(email, user, project)));
        const success = results.every(rst => !rst.err);

        return { success: success, message: results.map(rst => rst.err).join(';') };
    }

    @PUT('/project/:projectId/globalfunc')
    async updateGlobalFunction( @PathParam('projectId') projectId: string, @BodyParam globalFunc: any) {
        return await ProjectService.updateGlobalFunc(projectId, globalFunc.content);
    }

    @DELETE('/project/:projectId/file/:type/:name')
    deleteProjectFile( @PathParam('projectId') projectId: string, @PathParam('type') type: ProjectFolderType, @PathParam('name') name: string): ResObject {
        ProjectDataService.instance.removeFile(type, projectId, name);
        return { success: true, message: Message.deleteProjectFileSuccess };
    }

    @POST('/project/:projectId/:type')
    async uploadProjectFile(ctx: Koa.Context, @PathParam('projectId') projectId: string, @PathParam('type') type: ProjectFolderType) {
        if (!Setting.instance.enableUpload) {
            return;
        }

        let fileName;
        const storage = multer.diskStorage({
            destination: function (req: any, file: any, cb: any) {
                ProjectDataService.instance.prepareProjectFolder(projectId);
                cb(null, ProjectDataService.instance.getProjectFile(projectId, '', type));
            },
            filename: function (req: any, file: any, cb: any) {
                fileName = file.originalname;
                cb(null, file.originalname);
            }
        });

        const upload = multer({
            storage,
            fileFilter: (req, file, cb) => this.updateFileFilter(type, req, file, cb),
            limits: { filedSize: 1024 * 1024 * 100 }
        });
        try {
            await upload.single('projectfile')(ctx);
            ProjectDataService.instance.handleUploadFile(projectId, fileName, type);
            ctx.status = 200;
        } catch (err) {
            ctx.status = 500;
            ctx.body = err;
        }
    }

    private updateFileFilter(type: ProjectFolderType, req: any, file: any, cb: any) {
        if (type === 'lib' && !file.originalname.endsWith('.zip')) {
            cb(new Error('only support zip file for js lib.'));
        } else {
            cb(null, true);
        }
    }
}