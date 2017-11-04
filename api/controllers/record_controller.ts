import { POST, PUT, DELETE, BodyParam, PathParam, BaseController } from 'webapi-router';
import { ResObject } from '../common/res_object';
import * as Koa from 'koa';
import { RecordService } from '../services/record_service';
import { RecordRunner } from '../run_engine/record_runner';
import { DtoRecord } from '../interfaces/dto_record';
import { DtoRecordRun } from '../interfaces/dto_record_run';
import { DtoRecordSort } from '../interfaces/dto_record_sort';
import { SessionService } from '../services/session_service';

export default class RecordController extends BaseController {

    @POST('/record')
    async create(ctx: Koa.Context, @BodyParam record: DtoRecord): Promise<ResObject> {
        const user = SessionService.getUser(ctx);
        return await RecordService.create(RecordService.fromDto(record), user);
    }

    @PUT('/record')
    async update(ctx: Koa.Context, @BodyParam record: DtoRecord): Promise<ResObject> {
        const user = SessionService.getUser(ctx);
        return await RecordService.update(RecordService.fromDto(record), user);
    }

    @DELETE('/record/:id')
    async delete( @PathParam('id') id: string): Promise<ResObject> {
        return await RecordService.delete(id);
    }

    @POST('/record/run')
    async run(ctx: Koa.Context, @BodyParam data: DtoRecordRun) {
        const record = RecordService.fromDto(data.record);
        const userId = SessionService.getUserId(ctx);
        return await RecordRunner.runRecordFromClient(record, data.environment, userId, ctx.res);
    }

    @POST('/record/sort')
    async sort( @BodyParam info: DtoRecordSort) {
        return await RecordService.sort(info.recordId, info.folderId, info.collectionId, info.newSort);
    }
}