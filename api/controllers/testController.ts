import baseController from '../common/baseController';
import { GET, POST, DELETE, PUT, PathParam, QueryParam, BodyParam } from '../utils/decorators';
import { CaseService } from '../services/collectionService';
import { Database } from 'sqlite3';
import * as fs from 'fs';

export default class Test extends baseController{

    @GET()
    test(){
        console.info("test");
        CaseService.getAll("");
    }

    @GET('/aaa/:id/:pwd')
    test1(@PathParam('id') id: string, @PathParam('pwd') pwd: number, @QueryParam('name') name: string, @BodyParam body: Object){
        console.info(`id:${id}, name:${name}, body:${body}`);
    }
}