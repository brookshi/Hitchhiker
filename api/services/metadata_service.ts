import { PostmanCollectionV1, PostmanRecord, PostmanAllV1 } from '../interfaces/postman_v1';
import { MetadataType } from '../common/metadata_type';
import { Collection } from '../models/collection';
import { User } from '../models/user';
import { DtoRecord } from '../interfaces/dto_record';
import { RecordService } from './record_service';
import { DtoHeader } from '../interfaces/dto_header';
import { RecordCategory } from '../common/record_category';
import { Environment } from '../models/environment';
import { DtoVariable } from '../interfaces/dto_variable';
import { ProjectService } from './project_service';
import { VariableService } from './variable_service';
import { CollectionService } from './collection_service';
import { StringUtil } from '../utils/string_util';
import * as _ from 'lodash';

export class MetadataService {

    static async convertPostmanCollection(owner: User, projectId: string, data: any): Promise<Collection[]> {
        if (!data) {
            return [];
        }
        const type = MetadataService.getMetadataCategory(data);
        switch (type) {
            case MetadataType.PostmanCollectionV1:
                return [await MetadataService.convertPostmanCollectionV1(owner, projectId, data)];
            case MetadataType.PostmanAllV1:
                return await MetadataService.convertPostmanAllCollectionV1(owner, projectId, data);
            default:
                throw new Error(`not support this type: ${type}`);
        }
    }

    static async convertPostmanAllCollectionV1(owner: User, projectId: string, data: PostmanAllV1): Promise<Collection[]> {
        if (!data.collections) {
            return [];
        }
        return await Promise.all(data.collections.map(c => MetadataService.convertPostmanCollectionV1(owner, projectId, c)));
    }

    static async convertPostmanEnvV1(owner: User, projectId: string, data: any): Promise<Environment[]> {
        const type = MetadataService.getMetadataCategory(data);
        if (type !== MetadataType.PostmanAllV1 || !data.environments) {
            return [];
        }

        return data.environments.map(e => {
            const env = new Environment();
            env.name = e.name;
            env.id = StringUtil.generateUID();
            env.variables = [];
            env.project = ProjectService.create(projectId);

            let sort = 0;
            if (e.values) {
                e.values.forEach(v => {
                    const dtoVariable = <DtoVariable>v;
                    dtoVariable.isActive = v.enabled;
                    dtoVariable.sort = sort++;
                    const variable = VariableService.fromDto(dtoVariable);
                    variable.id = StringUtil.generateUID();
                    variable.environment = env;
                    env.variables.push(variable);
                });
            }
            return env;
        });
    }

    static async convertPostmanCollectionV1(owner: User, projectId: string, data: PostmanCollectionV1): Promise<Collection> {
        let sort = await RecordService.getMaxSort();
        const dtoCollection = { ...data, commonPreScript: '', projectId: projectId, id: StringUtil.generateUID() };
        const collection = CollectionService.fromDto(dtoCollection);

        collection.owner = owner;
        collection.project = ProjectService.create(projectId);
        if (data.folders) {
            data.folders.forEach(f => {
                const dtoRecord = MetadataService.convertFolder(f, collection.id, ++sort);
                collection.records.push(RecordService.fromDto(dtoRecord));
            });
        }

        if (data.requests) {
            data.requests.forEach(r => {
                const dtoRecord = MetadataService.convertRequest(r, collection.id, data.folders, ++sort);
                collection.records.push(RecordService.fromDto(dtoRecord));
            });
        }

        return collection;
    }

    static getMetadataCategory(data: any): MetadataType {
        if (data.version && data.version === 1) {
            return MetadataType.PostmanAllV1;
        } else if (data.item) {
            return MetadataType.PostmanCollectionV2;
        } else {
            return MetadataType.PostmanCollectionV1;
        }
    }

    private static convertFolder(f: PostmanRecord, cid: string, sort: number): DtoRecord {
        const dtoRecord = <DtoRecord>f;
        dtoRecord.collectionId = cid;
        dtoRecord.sort = sort;
        dtoRecord.category = RecordCategory.folder;
        dtoRecord.id = StringUtil.generateUID();
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
        dtoRecord.id = StringUtil.generateUID();
        dtoRecord.prescript = r.preRequestScript;
        return dtoRecord;
    }

    private static convertBody(data: PostmanRecord): string {
        return _.isString(data.rawModeData || data.data) ? (data.rawModeData || data.data) : '';
    }

    private static convertHeaders(headers: string | DtoHeader[]): DtoHeader[] {
        let sort = 0;
        if (headers instanceof Array) {
            return headers.map((h, i) => ({ ...h, id: StringUtil.generateUID(), sort: i }));
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
                    isFav: false,
                    sort: sort++
                });
            }
        });
        return rst;
    }
}