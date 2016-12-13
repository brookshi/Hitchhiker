import baseController from '../common/baseController';
import { GET, POST, DELETE, PUT, PathParam, QueryParam, BodyParam } from '../utils/decorators';

export default class Test extends baseController{

    @GET()
    test(){
        console.info("test");
    }

    @GET('/aaa/:id/:pwd')
    test1(@PathParam('id') id: string, @PathParam('pwd') pwd: number, @QueryParam('name') name: string, @BodyParam body: Object){
        console.info(`id:${id}, name:${name}, body:${body}`);
    }
}