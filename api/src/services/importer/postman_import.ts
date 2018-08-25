import { RequestsImport } from '../base/request_import';
import * as _ from 'lodash';
import { User } from '../../models/user';
import { RecordService } from '../record_service';
import { CollectionService } from '../collection_service';
import { EnvironmentService } from '../environment_service';
import { PostmanRecord, PostmanCollectionV1, PostmanAllV1 } from '../../common/interfaces/postman_v1';
import { DtoHeader } from '../../common/interfaces/dto_header';
import { StringUtil } from '../../utils/string_util';
import { DtoRecord } from '../../common/interfaces/dto_record';
import { RecordCategory } from '../../common/enum/record_category';
import { MetadataType } from '../../common/enum/metadata_type';
import { ProjectService } from '../project_service';
import { Collection } from '../../models/collection';
import { DtoVariable, DtoBodyFormData } from '../../common/interfaces/dto_variable';
import { Environment } from '../../models/environment';
import { VariableService } from '../variable_service';
import { DataMode } from '../../common/enum/data_mode';

export class PostmanImport implements RequestsImport {

    async import(data: any, projectId: string, user: User): Promise<void> {
        const collections = await this.parsePostmanCollection(user, projectId, data);
        const environments = await this.parsePostmanEnvV1(user, projectId, data);

        await Promise.all(collections.map(c => CollectionService.save(c)));

        await Promise.all(_.flatten(collections.map(c => c.records)).map(r => RecordService.saveRecordHistory(RecordService.createRecordHistory(r, user))));

        await Promise.all(environments.map(e => EnvironmentService.save(e)));
    }

    async parsePostmanCollection(owner: User, projectId: string, data: any): Promise<Collection[]> {
        if (!data) {
            return [];
        }
        const type = this.getMetadataCategory(data);
        switch (type) {
            case MetadataType.PostmanCollectionV1:
                return [await this.parsePostmanCollectionV1(owner, projectId, data)];
            case MetadataType.PostmanAllV1:
                return await this.parsePostmanAllCollectionV1(owner, projectId, data);
            default:
                throw new Error(`not support this type: ${type}`);
        }
    }

    async parsePostmanAllCollectionV1(owner: User, projectId: string, data: PostmanAllV1): Promise<Collection[]> {
        if (!data.collections) {
            return [];
        }
        return await Promise.all(data.collections.map(c => this.parsePostmanCollectionV1(owner, projectId, c)));
    }

    async parsePostmanEnvV1(_owner: User, projectId: string, data: any): Promise<Environment[]> {
        if (!data.environments) {
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

    async parsePostmanCollectionV1(owner: User, projectId: string, data: PostmanCollectionV1): Promise<Collection> {
        let sort = await RecordService.getMaxSort();
        const dtoCollection = {
            ...data,
            commonPreScript: '',
            commonSetting: { prescript: data.commonPreScript || '', test: '', headers: [] },
            projectId: projectId,
            id: StringUtil.generateUID()
        };
        const collection = CollectionService.fromDto(dtoCollection);

        collection.owner = owner;
        collection.project = ProjectService.create(projectId);
        if (data.folders) {
            data.folders.forEach(f => {
                const dtoRecord = this.parseFolder(f, collection.id, ++sort);
                collection.records.push(RecordService.fromDto(dtoRecord));
            });
        }

        if (data.requests) {
            data.requests.forEach(r => {
                const dtoRecord = this.parseRequest(r, collection.id, data.folders, ++sort);
                collection.records.push(RecordService.fromDto(dtoRecord));
            });
        }

        return collection;
    }

    getMetadataCategory(data: any): MetadataType {
        if (data.version && data.version === 1) {
            return MetadataType.PostmanAllV1;
        } else if (data.item) {
            return MetadataType.PostmanCollectionV2;
        } else {
            return MetadataType.PostmanCollectionV1;
        }
    }

    private parseFolder(f: PostmanRecord, cid: string, sort: number): DtoRecord {
        const dtoRecord = <DtoRecord>f;
        dtoRecord.collectionId = cid;
        dtoRecord.sort = sort;
        dtoRecord.dataMode = DataMode.raw;
        dtoRecord.category = RecordCategory.folder;
        f.id = dtoRecord.id = StringUtil.generateUID();
        return dtoRecord;
    }

    private parseRequest(r: PostmanRecord, cid: string, folders: PostmanRecord[], sort: number): DtoRecord {
        const dtoRecord = <DtoRecord>r;
        dtoRecord.collectionId = cid;
        dtoRecord.sort = sort;
        dtoRecord.headers = this.parseHeaders(r.headers);
        dtoRecord.body = this.parseBody(r);
        dtoRecord.formDatas = this.parseFormData(r.data);
        dtoRecord.test = r.tests;
        dtoRecord.dataMode = r.dataMode === 'urlencoded' ? DataMode.urlencoded : DataMode.raw;
        dtoRecord.category = RecordCategory.record;
        const folder = folders ? folders.find(f => f.order && !!f.order.find(o => o === dtoRecord.id)) : undefined;
        dtoRecord.pid = folder ? folder.id : '';
        dtoRecord.id = StringUtil.generateUID();
        dtoRecord.prescript = r.preRequestScript;
        return dtoRecord;
    }

    private parseBody(data: PostmanRecord): string {
        return _.isString(data.rawModeData || data.data) ? (data.rawModeData || data.data) : '';
    }

    private parseFormData(data: any): DtoBodyFormData[] {
        if (!_.isArray(data)) {
            return;
        }
        return (data as any[]).map((d, i) => ({ id: StringUtil.generateUID(), key: d.key, value: d.value, isActive: d.enabled, description: d.description, sort: i }));
    }

    private parseHeaders(headers: string | DtoHeader[]): DtoHeader[] {
        let sort = 0;
        if (headers instanceof Array) {
            return headers.map((h, i) => ({ ...h, id: StringUtil.generateUID(), sort: i }));
        }
        let rst = new Array<DtoHeader>();
        const headerArr = headers && typeof headers === 'string' ? headers.split('\n') : [];
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