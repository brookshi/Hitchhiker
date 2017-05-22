import { ResObject } from '../common/res_object';
import { Environment } from '../models/environment';
import { User } from '../models/user';
import { ConnectionManager } from "./connection_manager";
import { Variable } from "../models/variable";
import { DtoVariable } from "../interfaces/dto_variable";
import { Message } from "../common/message";
import { StringUtil } from "../utils/string_util";
import { DtoEnvironment } from "../interfaces/dto_environment";
import { VariableService } from "./variable_service";

export class EnvironmentService {

    static fromDto(dtoEnv: DtoEnvironment): Environment {
        const env = new Environment();
        env.name = dtoEnv.name;
        env.id = dtoEnv.id || StringUtil.generateUID();
        env.variables = [];
        return env;
    }

    static async save(env: Environment) {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(Environment).persist(env);
    }

    static formatVariables(env: Environment): { [key: string]: string } {
        let variables: { [key: string]: string } = {};
        env.variables.forEach(o => {
            if (o.isActive) {
                variables[o.key] = o.value;
            }
        });
        return variables;
    }

    static async get(id: string, needVars: boolean = false): Promise<Environment> {
        const connection = await ConnectionManager.getInstance();
        let rep = await connection.getRepository(Environment).createQueryBuilder('env');
        if (needVars) {
            rep = rep.leftJoinAndSelect('env.variables', 'variable');
        }
        return await rep.where('env.id=:id').addParameters({ 'id': id }).getOne();
    }

    static async create(name: string, variables: DtoVariable[], userId: string): Promise<ResObject> {
        const owner = new User();
        owner.id = userId;

        const env = new Environment();
        env.id = StringUtil.generateUID();
        env.name = name;
        if (variables) {
            variables.forEach(v => {
                env.variables.push(VariableService.create(v.key, v.value, v.isActive, v.sort, env));
            });
        }

        await EnvironmentService.save(env);

        return { success: true, message: Message.envCreateSuccess };
    }

    static async update(id: string, name: string, variables: DtoVariable[]): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();
        const env = await EnvironmentService.get(id, true);
        if (!env) {
            throw new Error(Message.envNotExist);
        }
        if (env.variables && env.variables.length > 0) {
            await connection.getRepository(Variable).remove(env.variables);
        }

        env.name = name;
        env.variables = [];
        if (variables) {
            variables.forEach(v => {
                env.variables.push(VariableService.create(v.key, v.value, v.isActive, v.sort, env));
            });
        }
        await EnvironmentService.save(env);

        return { success: true, message: Message.envUpdateSuccess };
    }

    static async delete(id: string): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();
        const env = await EnvironmentService.get(id, true);
        if (env) {
            await connection.getRepository(Variable).remove(env.variables);
            await connection.getRepository(Environment).remove(env);
        }

        return { success: true, message: Message.envDeleteSuccess };
    }
}