import { Collection } from '../models/collection';
import { UserCollectionService } from '../services/userCollectionService';
import { User } from '../models/user';
import { GET, POST, DELETE, PUT, PathParam, QueryParam, BodyParam, BaseController } from 'webapi-router';
import { ResObject } from "../models/ResObject";
import * as Koa from 'koa';

export default class CollectionController extends BaseController {

    @GET('collections')
    async getCollections(ctx: Koa.Context, env: string): Promise<Collection[]> {
        const user = <User>ctx.session.user;
        return await UserCollectionService.getUserCollections(user.id, env);
    }
}