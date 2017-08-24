import { StringUtil } from '../utils/string_util';
import { Record } from '../models/record';
import { EnvironmentService } from './environment_service';
import { Variable } from '../models/variable';
import { Environment } from '../models/environment';
import { DtoVariable } from '../interfaces/dto_variable';

export class VariableService {

    static create(key: string, value: string, isActive: boolean, sort: number, env?: Environment): Variable {
        const variable = new Variable();
        variable.key = key;
        variable.value = value;
        variable.isActive = isActive;
        variable.sort = sort;
        variable.environment = env;
        return variable;
    }

    static fromDto(dtoVariable: DtoVariable) {
        const variable = dtoVariable as Variable;
        variable.id = variable.id || StringUtil.generateUID();
        return variable;
    }

    static async applyVariableForRecord(envId: string, r: Record): Promise<Record> {
        const record = { ...r };
        const env = await EnvironmentService.get(envId, true);
        if (!env) {
            return record;
        }
        const variables = EnvironmentService.formatVariables(env);
        record.url = StringUtil.applyTemplate(record.url, variables);
        record.body = StringUtil.applyTemplate(record.body, variables);
        record.test = StringUtil.applyTemplate(record.test, variables);
        record.headers = r.headers.map(header => ({
            ...header,
            key: StringUtil.applyTemplate(header.key, variables),
            value: StringUtil.applyTemplate(header.value, variables)
        }));

        return record;
    }
}