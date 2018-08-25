import { GET, POST, PUT, DELETE, QueryParam, BodyParam, PathParam, BaseController } from 'webapi-router';
import { ResObject } from '../interfaces/res_object';
import * as Koa from 'koa';
import { DtoSchedule } from '../common/interfaces/dto_schedule';
import { ScheduleService } from '../services/schedule_service';
import { ScheduleRecordService } from '../services/schedule_record_service';
import { Message } from '../utils/message';
import { ScheduleRunner } from '../run_engine/schedule_runner';

export default class ScheduleController extends BaseController {

    @POST('/schedule')
    async createNew(ctx: Koa.Context, @BodyParam schedule: DtoSchedule): Promise<ResObject> {
        return ScheduleService.createNew(schedule, (<any>ctx).session.user);
    }

    @PUT('/schedule')
    async update(@BodyParam schedule: DtoSchedule): Promise<ResObject> {
        return ScheduleService.update(schedule);
    }

    @DELETE('/schedule/:id')
    async delete(@PathParam('id') id: string): Promise<ResObject> {
        return ScheduleService.delete(id);
    }

    @GET('/schedules')
    async getSchedules(ctx: Koa.Context): Promise<ResObject> {
        const schedules = await ScheduleService.getByUserId((<any>ctx).session.userId);
        return { success: true, message: '', result: schedules };
    }

    @GET('/schedule/:id/records')
    async getSchedulesInPage(@PathParam('id') id: string, @QueryParam('pagenum') pageNum: number): Promise<ResObject> {
        const [schedules] = await ScheduleRecordService.get(id, pageNum);
        return { success: true, message: '', result: schedules };
    }

    @GET('/schedule/:id/run')
    async run(@PathParam('id') id: string): Promise<ResObject> {
        const schedule = await ScheduleService.getById(id);
        if (!schedule) {
            return { success: false, message: Message.get('scheduleNotExist') };
        }

        new ScheduleRunner().runSchedule(schedule, null, false);
        return { success: true, message: '' };
    }
}