import { GET, POST, PUT, DELETE, BodyParam, PathParam, BaseController } from 'webapi-router';
import { ResObject } from '../interfaces/res_object';

export default class SampleController extends BaseController {

    @GET('/sample/:id')
    async getById(@PathParam('id') id: any): Promise<ResObject> {
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
    addSample(@BodyParam body: any): ResObject {
        return {
            success: true,
            message: 'add sample success.',
            result: body
        };
    }

    @PUT('/sample')
    changeSample(@BodyParam body: any): ResObject {
        return {
            success: true,
            message: 'update sample success.',
            result: body
        };
    }

    @DELETE('/sample/:id')
    delete(@PathParam('id') id: any): ResObject {
        return {
            success: true,
            message: `delete sample ${id} success`
        };
    }

    @GET('/sample/action/assert')
    assert() {
        return {
            root: {
                array: [100, 102, 104],
                boolean: true,
                number: 10000,
                string: 'hitchhiker',
                objArr: [
                    { name: '111' },
                    { name: '222' }
                ]
            }
        };
    }
}