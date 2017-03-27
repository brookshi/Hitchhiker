import { Record } from '../models/record';
import { POST, PUT, BodyParam, BaseController } from 'webapi-router';
import { ResObject } from "../common/res_object";
import * as Koa from 'koa';
import { RecordService } from "../services/record_service";
import { Runner } from "../run_engine/runner";

export default class RecordController extends BaseController {

    @POST('/record')
    async create(ctx: Koa.Context, @BodyParam record: Record): Promise<ResObject> {
        return await RecordService.create(Record.clone(record));
    }

    @PUT('/record')
    async update( @BodyParam record: Record): Promise<ResObject> {
        return await RecordService.update(Record.clone(record));
    }

    @POST('/record/run')
    async run(ctx: Koa.Context, @BodyParam data: { record: Record, env: string }) {
        const res = await Runner.runRecord(data.env, Record.clone(data.record), ctx.res);
        return res.body;
    }
}