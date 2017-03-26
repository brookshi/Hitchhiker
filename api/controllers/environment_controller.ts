import { User } from '../models/user';
import { POST, DELETE, PUT, PathParam, BodyParam, BaseController } from 'webapi-router';
import { ResObject } from "../common/res_object";
import * as Koa from 'koa';
import { Variable } from "../models/variable";
import { EnvironmentService } from "../services/environment_service";

export default class EnvironmentController extends BaseController {

    @POST('/environment')
    async create(ctx: Koa.Context, @BodyParam env: { name: string, variables: Variable[] }): Promise<ResObject> {
        const user = <User>ctx.session.user;
        return await EnvironmentService.create(env.name, env.variables, user);
    }

    @PUT('/environment')
    async update(ctx: Koa.Context, @BodyParam env: { id: string, name: string, variables: Variable[] }): Promise<ResObject> {
        return await EnvironmentService.update(env.id, env.name, env.variables);
    }

    @DELETE("/environment/:id")
    async delete( @PathParam('id') id: string) {
        return await EnvironmentService.delete(id);
    }

}