import { StringUtil } from '../utils/string_util';
import { Record } from '../models/record';
import { EnvironmentService } from './environment_service';
import { Variable } from '../models/variable';
import { Environment } from '../models/environment';
import { DtoVariable } from '../common/interfaces/dto_variable';

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
        record.prescript = StringUtil.applyTemplate(record.prescript, variables);
        record.headers = r.headers.map(header => ({
            ...header,
            key: StringUtil.applyTemplate(header.key, variables),
            value: StringUtil.applyTemplate(header.value, variables)
        }));
        record.queryStrings = r.queryStrings.map(queryString => ({
            ...queryString,
            key: StringUtil.applyTemplate(queryString.key, variables),
            value: StringUtil.applyTemplate(queryString.value, variables)
        }));
        record.formDatas = r.formDatas.map(formData => ({
            ...formData,
            key: StringUtil.applyTemplate(formData.key, variables),
            value: StringUtil.applyTemplate(formData.value, variables)
        }));

        return record;
    }

    static async applyVariable(envId: string, content: string): Promise<string> {
        const env = await EnvironmentService.get(envId, true);
        if (!env) {
            return content;
        }
        const variables = EnvironmentService.formatVariables(env);
        return StringUtil.applyTemplate(content, variables);
    }
}