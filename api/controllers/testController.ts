import { GET, POST, DELETE, PUT, PathParam, QueryParam, BodyParam, BaseController } from 'webapi-router';
import { UserCollectionService } from '../services/userCollectionService';
import { Collection } from "../models/collection";

export default class Test extends BaseController {

    @GET()
    async test(): Promise<Collection[]> {
        const collections = await UserCollectionService.getUserCollections("1", "develop");
        return collections;
    }

    @GET('/aaa/:id/:pwd')
    test1( @PathParam('id') id: string, @PathParam('pwd') pwd: number, @QueryParam('name') name: string, @BodyParam body: Object) {
        console.info(`id:${id}, name:${name}, body:${body}`);
    }
}