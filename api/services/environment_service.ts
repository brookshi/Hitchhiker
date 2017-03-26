import { ResObject } from '../common/res_object';
import { Environment } from '../models/environment';
import { User } from '../models/user';
import { ConnectionManager } from "./connection_manager";
import { Variable } from "../models/variable";

export class EnvironmentService {

    static async get(id: string, needVars: boolean = false): Promise<Environment> {
        const connection = await ConnectionManager.getInstance();
        let rep = await connection.getRepository(Environment).createQueryBuilder('env');
        if (needVars) {
            rep = rep.innerJoinAndSelect('env.variables', 'variable');
        }
        return await rep.where('env.id=:id').addParameters({ 'id': id }).getOne();
    }

    static async create(name: string, variables: Variable[], owner: User): Promise<ResObject> {
        const env = new Environment(name, variables, owner);
        await env.save();

        return { success: true, message: '' };
    }

    static async update(id: string, name: string, variables: Variable[]): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();
        const env = await EnvironmentService.get(id, true);
        if (!env) {
            throw new Error('enviornment doesnot exist');
        }
        if (env.variables && env.variables.length > 0) {
            await connection.getRepository(Variable).remove(env.variables);
        }
        await env.update(name, variables);

        return { success: true, message: '' };
    }

    static async delete(id: string): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();
        const env = await EnvironmentService.get(id, true);
        if (env) {
            await connection.getRepository(Variable).remove(env.variables);
            await connection.getRepository(Environment).remove(env);
        }

        return { success: true, message: '' };
    }
}