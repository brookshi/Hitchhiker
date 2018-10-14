import { POST, PUT, DELETE, BodyParam, PathParam, BaseController } from 'webapi-router';
import { ResObject } from '../interfaces/res_object';
import * as Koa from 'koa';
import { SessionService } from '../services/session_service';
import { MockCollectionService } from '../services/mock_collection_service';
import { DtoMockCollection } from '../common/interfaces/dto_mock_collection';
import { DtoMock } from '../common/interfaces/dto_mock';
import { MockService } from '../services/mock_service';

export default class MockController extends BaseController {

    @POST('/mock/collection')
    async createCollection(ctx: Koa.Context, @BodyParam collection: DtoMockCollection): Promise<ResObject> {
        const userId = SessionService.getUserId(ctx);
        return await MockCollectionService.create(collection, userId);
    }

    @PUT('/mock/collection')
    async updateCollection(@BodyParam collection: DtoMockCollection): Promise<ResObject> {
        return await MockCollectionService.update(collection);
    }

    @DELETE('/mock/collection/:id')
    async deleteCollection(@PathParam('id') id: string): Promise<ResObject> {
        return await MockCollectionService.delete(id);
    }

    @POST('/mock')
    async create(@BodyParam mock: DtoMock): Promise<ResObject> {
        return await MockService.create(MockService.fromDto(mock));
    }

    @PUT('/mock')
    async update(@BodyParam record: DtoMock): Promise<ResObject> {
        return await MockService.update(MockService.fromDto(record));
    }

    @DELETE('/mock/:id')
    async delete(@PathParam('id') id: string): Promise<ResObject> {
        return await MockService.delete(id);
    }
}