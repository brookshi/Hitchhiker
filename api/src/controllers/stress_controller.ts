import { GET, POST, PUT, DELETE, BodyParam, PathParam, BaseController } from 'webapi-router';
import { ResObject } from '../common/res_object';
import * as Koa from 'koa';
import { DtoStress } from '../interfaces/dto_stress';
import { StressService } from '../services/stress_service';

export default class StressController extends BaseController {

    @POST('/stress')
    async createNew(ctx: Koa.Context, @BodyParam stress: DtoStress): Promise<ResObject> {
        return StressService.createNew(stress, (<any>ctx).session.user);
    }

    @PUT('/stress')
    async update(@BodyParam stress: DtoStress): Promise<ResObject> {
        return StressService.update(stress);
    }

    @DELETE('/stress/:id')
    async delete(@PathParam('id') id: string): Promise<ResObject> {
        return StressService.delete(id);
    }

    @GET('/stresses')
    async getStresses(ctx: Koa.Context): Promise<ResObject> {
        const stresses = await StressService.getByUserId((<any>ctx).session.userId);
        return { success: true, message: '', result: stresses };
    }
}