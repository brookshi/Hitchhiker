import { GET, POST, DELETE, PUT, PathParam, QueryParam, BodyParam, BaseController } from 'webapi-router';
import { ResObject } from "../models/ResObject";
import { UserService } from "../services/userService";

export default class UserController extends BaseController {

    @POST()
    async registe( @BodyParam body: { name: string, email: string, pwd: string }): Promise<ResObject> {
        return await UserService.createUser(body.name, body.email, body.pwd);
    }
}