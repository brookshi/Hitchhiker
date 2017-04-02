import { User } from '../models/user';
import { POST, DELETE, PUT, PathParam, BodyParam, BaseController } from 'webapi-router';
import { ResObject } from "../common/res_object";
import * as Koa from 'koa';
import { EnvironmentService } from "../services/environment_service";
import { DtoEnvironment } from "../interfaces/dto_environment";
import { SessionService } from "../services/session_service";

export default class EnvironmentController extends BaseController {

    @POST('/environment')
    async create(ctx: Koa.Context, @BodyParam env: DtoEnvironment): Promise<ResObject> {
        const userId = SessionService.getUserId(ctx);
        return await EnvironmentService.create(env.name, env.variables, userId);
    }

    @PUT('/environment')
    async update(ctx: Koa.Context, @BodyParam env: DtoEnvironment): Promise<ResObject> {
        return await EnvironmentService.update(env.id, env.name, env.variables);
    }

    @DELETE("/environment/:id")
    async delete( @PathParam('id') id: string) {
        return await EnvironmentService.delete(id);
    }

}