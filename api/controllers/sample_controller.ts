import { GET, POST, PUT, DELETE, BodyParam, PathParam, BaseController } from 'webapi-router';
import { ResObject } from '../common/res_object';
import * as Koa from 'koa';

export default class SampleController extends BaseController {

    @GET('/sample/:id')
    getById( @PathParam('id') id: any): ResObject {
        return {
            success: true,
            message: '',
            result: {
                id,
                name: 'sample'
            }
        };
    }

    @POST('/sample')
    addSample( @BodyParam body: any): ResObject {
        return {
            success: true,
            message: 'add sample success.',
            result: body
        };
    }

    @PUT('/sample')
    changeSample( @BodyParam body: any): ResObject {
        return {
            success: true,
            message: 'update sample success.',
            result: body
        };
    }

    @DELETE('/sample/:id')
    delete( @PathParam('id') id: any): ResObject {
        return {
            success: true,
            message: `delete sample ${id} success`
        };
    }
}