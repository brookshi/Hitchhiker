import { ResObject } from '../common/res_object';
import { Environment } from '../models/environment';
import { ConnectionManager } from "./connection_manager";
import { Variable } from "../models/variable";
import { Message } from "../common/message";
import { StringUtil } from "../utils/string_util";
import { DtoEnvironment } from "../interfaces/dto_environment";
import { VariableService } from "./variable_service";
import { Team } from "../models/team";

export class EnvironmentService {

    static fromDto(dtoEnv: DtoEnvironment): Environment {
        const env = new Environment();
        env.name = dtoEnv.name;
        env.id = dtoEnv.id || StringUtil.generateUID();
        env.variables = dtoEnv.variables.map(v => VariableService.fromDto(v));
        env.team = new Team();
        env.team.id = dtoEnv.team.id;
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

    static async create(dtoEnv: DtoEnvironment): Promise<ResObject> {
        const env = EnvironmentService.fromDto(dtoEnv);
        EnvironmentService.adjustVariables(env);

        await EnvironmentService.save(env);

        return { success: true, message: Message.envCreateSuccess };
    }

    private static adjustVariables(env: Environment) {
        env.variables.forEach((variable, index) => {
            variable.id = variable.id || StringUtil.generateUID();
            variable.sort = index;
        });
    }

    static async getEnvironments(ids: string[], needVariables: boolean = true, needTeam: boolean = true): Promise<Environment[]> {
        if (!ids || ids.length === 0) {
            return [];
        }
        const connection = await ConnectionManager.getInstance();

        let rep = connection.getRepository(Environment).createQueryBuilder('environment');
        if (needVariables) {
            rep = rep.leftJoinAndSelect('environment.variables', 'variable');
        }
        if (needTeam) {
            rep = rep.leftJoinAndSelect('environment.team', 'team');
        }

        return await rep.where('1=1')
            .andWhereInIds(ids)
            .getMany();
    }

    static async update(dtoEnv: DtoEnvironment): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();
        const env = await EnvironmentService.get(dtoEnv.id, true);
        if (env && env.variables && env.variables.length > 0) {
            await connection.getRepository(Variable).remove(env.variables);
        }
        const newEnv = EnvironmentService.fromDto(dtoEnv);
        EnvironmentService.adjustVariables(newEnv);

        await EnvironmentService.save(newEnv);

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