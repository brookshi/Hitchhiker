import { ConnectionManager } from './connection_manager';
import { StringUtil } from '../utils/string_util';
import { DtoQueryString } from '../common/interfaces/dto_variable';
import { QueryString } from '../models/query_string';

export class QueryStringService {
    static fromDto(dtoQueryString: DtoQueryString): QueryString {
        let queryString = new QueryString();
        queryString.key = dtoQueryString.key;
        queryString.value = dtoQueryString.value;
        queryString.isActive = dtoQueryString.isActive;
        queryString.sort = dtoQueryString.sort;
        queryString.id = dtoQueryString.id || StringUtil.generateUID();
        queryString.description = dtoQueryString.description;
        return queryString;
    }

    static clone(queryString: QueryString): QueryString {
        const target = <QueryString>Object.create(queryString);
        target.id = undefined;
        return target;
    }

    static async deleteForHost(hostName: string, hostId: string) {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(QueryString)
            .createQueryBuilder('queryString')
            .delete()
            .where(`${hostName}Id=:id`, { id: hostId })
            .execute();
    }
}