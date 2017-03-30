import { Record } from '../models/record';
import { POST, PUT, BodyParam, BaseController } from 'webapi-router';
import { ResObject } from "../common/res_object";
import * as Koa from 'koa';
import { RecordService } from "../services/record_service";
import { RecordRunner } from "../run_engine/record_runner";
import { DtoRecord } from "../interfaces/dto_record";
import { DtoRecordRun } from "../interfaces/dto_record_run";
import { DtoRecordSort } from "../interfaces/dto_record_sort";
import { TestRunner } from "../run_engine/test_runner";

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
        let record = Record.fromDto(data.record);
        const res = await RecordRunner.runRecord(data.environment, record, ctx.res);
        const testRst = TestRunner.test(ctx, record.test);
        return { 'body': res.body, 'test': testRst };
    }

    @POST('/record/sort')
    async sort( @BodyParam info: DtoRecordSort) {
        return await RecordService.sort(info.recordId, info.folderId, info.collectionId, info.newSort);
    }
}