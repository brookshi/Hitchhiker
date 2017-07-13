import { ResObject } from '../common/res_object';
import { Environment } from '../models/environment';
import { ConnectionManager } from './connection_manager';
import { Variable } from '../models/variable';
import { Message } from '../common/message';
import { StringUtil } from '../utils/string_util';
import { DtoEnvironment } from '../interfaces/dto_environment';
import { VariableService } from './variable_service';
import { Project } from '../models/project';

export class EnvironmentService {

    static fromDto(dtoEnv: DtoEnvironment): Environment {
        const env = new Environment();
        env.name = dtoEnv.name;
        env.id = dtoEnv.id || StringUtil.generateUID();
        env.variables = dtoEnv.variables.map(v => VariableService.fromDto(v));
        env.project = new Project();
        env.project.id = dtoEnv.project.id;
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
        return await rep.where('env.id=:id', { 'id': id }).getOne();
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

    static async getEnvironments(ids: string[], needVariables: boolean = true, needProject: boolean = true): Promise<Environment[]> {
        if (!ids || ids.length === 0) {
            return [];
        }
        const connection = await ConnectionManager.getInstance();

        let rep = connection.getRepository(Environment).createQueryBuilder('environment');
        if (needVariables) {
            rep = rep.leftJoinAndSelect('environment.variables', 'variable');
        }
        if (needProject) {
            rep = rep.leftJoinAndSelect('environment.project', 'project');
        }

        return await rep.where('1=1')
            .andWhereInIds(ids.map(id => ({ id })))
            .getMany();
    }

    static async update(dtoEnv: DtoEnvironment): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();
        const env = await EnvironmentService.get(dtoEnv.id, true);
        const newEnv = EnvironmentService.fromDto(dtoEnv);
        EnvironmentService.adjustVariables(newEnv);
        await connection.transaction(async manager => {
            if (env && env.variables && env.variables.length > 0) {
                await manager.remove(env.variables);
            }
            await manager.save(newEnv);
        });

        return { success: true, message: Message.envUpdateSuccess };
    }

    static async delete(id: string): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();
        const env = await EnvironmentService.get(id, true);
        if (env) {
            await connection.transaction(async manager => {
                await manager.remove(env.variables);
                await manager.remove(env);
            });
        }

        return { success: true, message: Message.envDeleteSuccess };
    }
}