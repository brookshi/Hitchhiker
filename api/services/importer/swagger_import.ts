import { RequestsImport } from '../base/request_import';
import { Record } from '../../models/record';
import * as _ from 'lodash';
import { StringUtil } from '../../utils/string_util';
import { Collection } from '../../models/collection';
import { RecordCategory } from '../../common/record_category';
import { RecordService } from '../record_service';
import { ParameterType } from '../../common/parameter_type';
import { DtoHeader } from '../../interfaces/dto_header';
import { HeaderService } from '../header_service';
import { Header } from '../../models/header';
import { User } from '../../models/user';
import { CollectionService } from '../collection_service';
import { ProjectService } from '../project_service';
import { DtoCollection } from '../../interfaces/dto_collection';

export class SwaggerImport implements RequestsImport {

    baseUrl: string;

    async import(swaggerData: any, projectId: string, user: User): Promise<void> {
        this.baseUrl = `${swaggerData.host}${swaggerData.basePath}`;
        let sort = await RecordService.getMaxSort();
        const dtoCollection: DtoCollection = {
            name: swaggerData.info.title,
            commonPreScript: '',
            projectId: projectId,
            id: StringUtil.generateUID(),
            description: swaggerData.info.description
        };

        const collection = CollectionService.fromDto(dtoCollection);
        collection.owner = user;
        collection.project = ProjectService.create(projectId);
        collection.records = this.createRecords(swaggerData, collection.id, sort);

        await CollectionService.save(collection);

        await Promise.all(collection.records.map(r => RecordService.saveRecordHistory(RecordService.createRecordHistory(r, user))));
    }

    private createRecords(swaggerData: any, collectionId: string, sort: number): Record[] {
        const folders: _.Dictionary<Record> = {};
        _.keys(swaggerData.paths).forEach(path => {
            path = path.substr(1);
            if (path.includes('/')) {
                path = path.substr(0, path.indexOf('/'));
            }
            if (folders[path]) {
                folders[path] = this.createFolder(path, collectionId, ++sort);
            }

            folders[path].children = this.createRecordsForFolder(path, swaggerData.paths[path], folders[path].id, collectionId, ++sort);
        });
        return _.values(folders);
    }

    private createFolder(name: string, collectionId: string, sort: number): Record {
        return RecordService.fromDto({
            id: StringUtil.generateUID(),
            name,
            collectionId,
            category: RecordCategory.folder,
            parameterType: ParameterType.ManyToMany,
            sort
        });
    }

    private createRecordsForFolder(path: string, methodDatas: any, folderId: string, collectionId: string, sort: number): Record[] {
        return _.keys(methodDatas).map(method => {
            const methodData = methodDatas[method];
            return RecordService.fromDto({
                id: StringUtil.generateUID(),
                name: methodData.summary,
                collectionId,
                pid: folderId,
                category: RecordCategory.record,
                parameterType: ParameterType.ManyToMany,
                url: this.parseUrl(path, methodData),
                method: method.toUpperCase(),
                headers: this.parseHeaders(methodData),
                body: this.parseFormData(methodData),
                sort
            });
        });
    }

    private parseUrl(path: string, methodData: any): string {
        path = path.replace('{', ':').replace('}', '');
        let url = `${this.baseUrl}${path}`;

        if (methodData.parameters) {
            methodData.parameters.filter(p => p.in === 'query').foreach(p => {
                url = `${url}${url.includes('?') ? '&' : '?'}${p.name}={{${p.name}}}`;
            });
        }

        return url;
    }

    private parseFormData(methodData: any): string {
        let formDatas: string[] = [];
        if (methodData.parameters) {
            methodData.parameters.filter(p => p.in === 'formData').foreach(p => {
                formDatas.push(`${p.name}={{${p.name}}}`);
            });
        }
        return formDatas.join('&');
    }

    private parseHeaders(methodData: any): Header[] {
        const headers: DtoHeader[] = [];
        if (methodData.consumes) {
            headers.push({ key: 'Content-Type', value: methodData.consumes[0], isActive: true });
        }
        if (methodData.produces) {
            headers.push({ key: 'Accept', value: methodData.produces.join(', '), isActive: true });
        }
        if (methodData.parameters) {
            methodData.parameters.filter(p => p.in === 'header').foreach(h => {
                headers.push({ key: h.name, value: `{{${h.name}}}`, isActive: true });
            });
        }
        return headers.map(h => HeaderService.fromDto(h));
    }
}