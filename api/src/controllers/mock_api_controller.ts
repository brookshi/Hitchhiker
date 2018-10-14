import { GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS, PathParam, BaseController } from 'webapi-router';
import { MockService } from '../services/mock_service';

export default class MockApiController extends BaseController {

    // url rule: /mockapi/:collectionid/..
    @GET('/mockapi/:path*')
    async get(@PathParam('path') path: any) {
        return await this.getMockData('GET', path);
    }

    @POST('/mockapi/:path*')
    async post(@PathParam('path') path: any) {
        return await this.getMockData('POST', path);
    }

    @PUT('/mockapi/:path*')
    async put(@PathParam('path') path: any) {
        return await this.getMockData('PUT', path);
    }

    @DELETE('/mockapi/:path*')
    async delete(@PathParam('path') path: any) {
        return await this.getMockData('DELETE', path);
    }

    @PATCH('/mockapi/:path*')
    async patch(@PathParam('path') path: any) {
        return await this.getMockData('PATCH', path);
    }

    @HEAD('/mockapi/:path*')
    async head(@PathParam('path') path: any) {
        return await this.getMockData('HEAD', path);
    }

    @OPTIONS('/mockapi/:path*')
    async options(@PathParam('path') path: any) {
        return await this.getMockData('OPTIONS', path);
    }

    async getMockData(method: string, path: string) {
        return await MockService.getMockRes(method, `mockapi/${path}`);
    }
}