import { GET, POST, DELETE, PUT, PathParam, QueryParam, BodyParam, BaseController } from 'webapi-router';
import { CollectionService } from '../services/collectionService';

export default class Test extends BaseController {

    @GET()
    async test() {
        console.info("test");
        await CollectionService.getCollections("1", "develop");
    }

    @GET('/aaa/:id/:pwd')
    test1( @PathParam('id') id: string, @PathParam('pwd') pwd: number, @QueryParam('name') name: string, @BodyParam body: Object) {
        console.info(`id:${id}, name:${name}, body:${body}`);
    }
}