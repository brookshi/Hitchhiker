import { CollectionService } from '../services/collection_service';
import { Collection } from '../models/collection';
import { UserCollectionService } from '../services/user_collection_service';
import { User } from '../models/user';
import { GET, POST, BodyParam, BaseController } from 'webapi-router';
import { ResObject } from "../common/res_object";
import * as Koa from 'koa';

export default class CollectionController extends BaseController {

    @GET('/collections')
    async getCollections(ctx: Koa.Context): Promise<Collection[]> {
        const user = <User>ctx.session.user;
        return await UserCollectionService.getUserCollections(user.id);
    }

    @POST('/collection')
    async create(ctx: Koa.Context, @BodyParam collection: { name: string, description: string }): Promise<ResObject> {
        const user = <User>ctx.session.user;
        return await CollectionService.create(collection.name, collection.description, user);
    }
}