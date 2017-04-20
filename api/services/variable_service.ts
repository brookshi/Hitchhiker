import { StringUtil } from '../utils/string_util';
import { Record } from '../models/record';
import { EnvironmentService } from "./environment_service";
import { Variable } from "../models/variable";
import { Environment } from "../models/environment";
import { DtoVariable } from "../interfaces/dto_variable";

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
        return VariableService.create(
            dtoVariable.key,
            dtoVariable.value,
            dtoVariable.isActive,
            dtoVariable.sort
        );
    }

    static async applyVariableForRecord(envId: string, record: Record): Promise<Record> {
        const env = await EnvironmentService.get(envId, true);
        if (!env) {
            return record;
        }
        const variables = EnvironmentService.formatVariables(env);
        record.url = StringUtil.applyTemplate(record.url, variables);
        record.headers.forEach(header => {
            header.key = StringUtil.applyTemplate(header.key, variables);
            header.value = StringUtil.applyTemplate(header.value, variables);
        });

        return record;
    }
}