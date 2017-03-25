import { Record } from '../models/record';
import { POST, PUT, BodyParam, BaseController } from 'webapi-router';
import { ResObject } from "../common/res_object";
import * as Koa from 'koa';
import { RecordService } from "../services/record_service";

export default class RecordController extends BaseController {


    @POST('/record')
    async create(ctx: Koa.Context, @BodyParam record: Record): Promise<ResObject> {
        return await RecordService.create(record);
    }

    @PUT('/record')
    async update( @BodyParam record: Record): Promise<ResObject> {
        return await RecordService.update(record);
    }

    @POST('/record/run')
    async run( @BodyParam data: { record: Record, env: string }) {

    }
}