import { CollectionService } from '../services/collection_service';
import { Collection } from '../models/collection';
import { UserCollectionService } from '../services/user_collection_service';
import { GET, POST, BodyParam, PathParam, BaseController } from 'webapi-router';
import { ResObject } from "../common/res_object";
import * as Koa from 'koa';
import { DtoCollection } from "../interfaces/dto_collection";
import { SessionService } from "../services/session_service";

export default class CollectionController extends BaseController {

    @GET('/collections')
    async getCollections(ctx: Koa.Context): Promise<Collection[]> {
        const userId = SessionService.getUserId(ctx);
        return await UserCollectionService.getUserCollections(userId);
    }

    @POST('/collection')
    async create(ctx: Koa.Context, @BodyParam collection: DtoCollection): Promise<ResObject> {
        const userId = SessionService.getUserId(ctx);
        return await CollectionService.create(collection.name, collection.description, userId);
    }

    @GET('/collection/share/:collectionid/to/:teamid')
    async share(ctx: Koa.Context, @PathParam('collectionid') collectionId: string, @PathParam('teamid') teamId: string): Promise<ResObject> {

    }
}