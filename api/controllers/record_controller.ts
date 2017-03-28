import { Record } from '../models/record';
import { POST, PUT, BodyParam, BaseController } from 'webapi-router';
import { ResObject } from "../common/res_object";
import * as Koa from 'koa';
import { RecordService } from "../services/record_service";
import { Runner } from "../run_engine/runner";
import { DtoRecord } from "../interfaces/dto_record";
import { DtoRecordRun } from "../interfaces/dto_record_run";
import { DtoRecordSort } from "../interfaces/dto_record_sort";

export default class RecordController extends BaseController {

    @POST('/record')
    async create( @BodyParam record: DtoRecord): Promise<ResObject> {
        return await RecordService.create(Record.fromDto(record));
    }

    @PUT('/record')
    async update( @BodyParam record: DtoRecord): Promise<ResObject> {
        return await RecordService.update(Record.fromDto(record));
    }

    @POST('/record/run')
    async run(ctx: Koa.Context, @BodyParam data: DtoRecordRun) {
        const res = await Runner.runRecord(data.environment, Record.fromDto(data.record), ctx.res);
        return res.body;
    }

    @POST('/record/sort')
    async sort( @BodyParam info: DtoRecordSort) {
        return await RecordService.sort(info.recordId, info.collectionId, info.newSort);
    }
}