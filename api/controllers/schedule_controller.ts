import { GET, POST, PUT, DELETE, QueryParam, BodyParam, PathParam, BaseController } from 'webapi-router';
import { ResObject } from "../common/res_object";
import * as Koa from 'koa';
import { DtoSchedule } from "../interfaces/dto_schedule";
import { ScheduleService } from "../services/schedule_service";

export default class ScheduleController extends BaseController {

    @POST('/schedule')
    async createNew(ctx: Koa.Context, @BodyParam schedule: DtoSchedule): Promise<ResObject> {
        return ScheduleService.createNew(schedule, (<any>ctx).session.user);
    }

    @PUT('/schedule')
    async update( @BodyParam schedule: DtoSchedule): Promise<ResObject> {
        return ScheduleService.update(schedule);
    }

    @DELETE('/schedule/:id')
    async delete( @PathParam('id') id: string): Promise<ResObject> {
        return ScheduleService.delete(id);
    }
}