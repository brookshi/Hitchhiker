import { PostmanCollectionV1, PostmanRecord, PostmanAllV1 } from "../interfaces/postman_v1";
import { MetadataType } from "../common/metadata_type";
import { Collection } from "../models/collection";
import { Record } from "../models/record";
import { DtoCollection } from "../interfaces/dto_collection";
import { User } from "../models/user";
import { Team } from "../models/team";
import { DtoRecord } from "../interfaces/dto_record";
import { RecordService } from "./record_service";
import { DtoHeader } from "../interfaces/dto_header";
import { RecordCategory } from "../common/record_category";
import { Environment } from "../models/environment";
import { DtoEnvironment } from "../interfaces/dto_environment";
import { DtoVariable } from "../interfaces/dto_variable";
import { Variable } from "../models/variable";

export class MetadataService {

    static async convertPostmanCollection(owner: User, teamId: string, data: any): Promise<Collection[]> {
        if (!data) {
            return [];
        }
        const type = MetadataService.getMetadataCategory(data);
        switch (type) {
            case MetadataType.PostmanCollectionV1:
                return [await MetadataService.convertPostmanCollectionV1(owner, teamId, data)];
            case MetadataType.PostmanAllV1:
                return await MetadataService.convertPostmanAllCollectionV1(owner, teamId, data);
            default:
                throw new Error(`not support this type: ${type}`);
        }
    }

    static async convertPostmanAllCollectionV1(owner: User, teamId: string, data: PostmanAllV1): Promise<Collection[]> {
        if (!data.collections) {
            return [];
        }
        return await Promise.all(data.collections.map(c => MetadataService.convertPostmanCollectionV1(owner, teamId, c)));
    }

    static async convertPostmanEnvV1(owner: User, teamId: string, data: any): Promise<Environment[]> {
        const type = MetadataService.getMetadataCategory(data);
        if (type !== MetadataType.PostmanAllV1 || !data.environments) {
            return [];
        }

        return data.environments.map(e => {
            const env = new Environment(e.name, [], owner);
            env.team = new Team(teamId);

            let sort = 0;
            if (e.values) {
                e.values.forEach(v => {
                    const dtoVariable = <DtoVariable>v;
                    dtoVariable.isActive = v.enabled;
                    dtoVariable.sort = sort++;
                    const variable = Variable.fromDto(dtoVariable);
                    variable.environment = env;
                    env.variables.push(variable);
                });
            }
            return env;
        });
    }

    static async convertPostmanCollectionV1(owner: User, teamId: string, data: PostmanCollectionV1): Promise<Collection> {
        let sort = await RecordService.getMaxSort();
        const dtoCollection = <DtoCollection>data;
        const collection = Collection.fromDto(dtoCollection);

        collection.owner = owner;
        collection.team = new Team(teamId);
        if (data.folders) {
            data.folders.forEach(f => {
                const dtoRecord = MetadataService.convertFolder(f, collection.id, ++sort);
                collection.records.push(Record.fromDto(dtoRecord));
            });
        }

        if (data.requests) {
            data.requests.forEach(r => {
                const dtoRecord = MetadataService.convertRequest(r, collection.id, data.folders, ++sort);
                collection.records.push(Record.fromDto(dtoRecord));
            });
        }

        return collection;
    }

    static getMetadataCategory(data: any): MetadataType {
        if (data.version && data.version === 1) {
            return MetadataType.PostmanAllV1;
        }
        else if (data.item) {
            return MetadataType.PostmanCollectionV2;
        }
        else {
            return MetadataType.PostmanCollectionV1;
        }
    }

    private static convertFolder(f: PostmanRecord, cid: string, sort: number): DtoRecord {
        const dtoRecord = <DtoRecord>f;
        dtoRecord.collectionId = cid;
        dtoRecord.sort = sort;
        dtoRecord.category = RecordCategory.folder;
        return dtoRecord;
    }

    private static convertRequest(r: PostmanRecord, cid: string, folders: PostmanRecord[], sort: number): DtoRecord {
        const dtoRecord = <DtoRecord>r;
        dtoRecord.collectionId = cid;
        dtoRecord.sort = sort;
        dtoRecord.headers = MetadataService.convertHeaders(r.headers);
        dtoRecord.body = MetadataService.convertBody(r);
        dtoRecord.test = r.tests;
        dtoRecord.category = RecordCategory.record;
        const folder = folders ? folders.find(f => f.order && !!f.order.find(o => o === dtoRecord.id)) : undefined;
        dtoRecord.pid = folder ? folder.id : '';
        return dtoRecord;
    }

    private static convertBody(data: PostmanRecord): string {
        return data.rawModeData || data.data;
    }

    private static convertHeaders(headers: string | DtoHeader[]): DtoHeader[] {
        let sort = 0;
        if (headers instanceof Array) {
            return headers;
        }
        let rst = new Array<DtoHeader>();
        const headerArr = headers.split('\n');
        if (!headerArr) {
            return rst;
        }
        headerArr.forEach(header => {
            const keyValue = header.split(':');
            if (keyValue && keyValue.length > 1) {
                let key = keyValue[0].trim();
                let isActive = true;
                if (key.startsWith('//')) {
                    isActive = false;
                    key = key.substr(2);
                }
                rst.push({
                    key: key,
                    value: keyValue[1].trim(),
                    isActive: isActive,
                    sort: sort++
                });
            }
        });
        return rst;
    }
}