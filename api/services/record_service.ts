import { Record, RecordEx } from '../models/record';
import { ConnectionManager } from './connection_manager';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import * as _ from 'lodash';
import { ResObject } from '../common/res_object';
import { Message } from '../common/message';
import { Header } from '../models/header';
import { RecordCategory } from '../common/record_category';
import { DtoRecord } from '../interfaces/dto_record';
import { Collection } from '../models/collection';
import { HeaderService } from './header_service';
import { StringUtil } from '../utils/string_util';
import { RecordHistory } from '../models/record_history';
import { EntityManager } from 'typeorm';
import { User } from '../models/user';
import { UserService } from './user_service';
import { ProjectService } from './project_service';
import { EnvironmentService } from './environment_service';
import { VariableService } from './variable_service';
import { QueryStringService } from './query_string_service';
import { FormDataService } from './form_data_service';

export class RecordService {
    private static _sort: number = 0;

    static fromDto(target: DtoRecord): Record {
        let collection = new Collection();
        collection.id = target.collectionId;

        let record = new Record();
        record.id = target.id;
        record.url = target.url;
        record.pid = target.pid;
        record.body = target.body || '';
        record.headers = this.handleArray(target.headers, record.id, HeaderService.fromDto);
        record.test = target.test || '';
        record.sort = target.sort;
        record.method = target.method;
        record.collection = collection;
        record.name = target.name;
        record.description = target.description;
        record.category = target.category;
        record.bodyType = target.bodyType;
        record.dataMode = target.dataMode;
        record.parameters = target.parameters;
        record.parameterType = target.parameterType;
        record.prescript = target.prescript || '';
        record.assertInfos = target.assertInfos || {};
        record.queryStrings = this.handleArray(target.queryStrings, record.id, QueryStringService.fromDto);
        record.formDatas = this.handleArray(target.formDatas, record.id, FormDataService.fromDto);
        return record;
    }

    private static handleArray<TTarget extends { record: Record }, TDTO>(dtos: TDTO[] | any, id: string, fromDto: (o: TDTO) => TTarget) {
        if (dtos instanceof Array) {
            return dtos.map(o => {
                let target = fromDto(o);
                return this.setRecordForChild(target, id);
            });
        }
    }

    private static setRecordForChild<T extends { record: Record }>(child: T, id: string) {
        child.record = new Record();
        child.record.id = id;
        return child;
    }

    static toDto(target: Record): DtoRecord {
        return <DtoRecord><any>{ ...target, collectionId: target.collection.id };
    }

    static formatHeaders(record: Record): { [key: string]: string } {
        let headers: { [key: string]: string } = {};
        record.headers.forEach(o => {
            if (o.isActive) {
                headers[o.key] = o.value;
            }
        });
        return headers;
    }

    static formatKeyValue(keyValues: { key: string, value: string, isActive: boolean }[]) {
        let objs: { [key: string]: string } = {};
        keyValues.forEach(o => {
            if (o.isActive) {
                objs[o.key] = o.value;
            }
        });
        return objs;
    }

    static restoreKeyValue<T>(obj: { [key: string]: string }, fromDto: (dto: { isActive: boolean, key: string, value: string, id: string, sort: number }) => T) {
        const keyValues = [];
        _.keys(obj || {}).forEach(k => {
            keyValues.push(fromDto({
                isActive: true,
                key: k,
                value: obj[k],
                id: '',
                sort: 0
            }));
        });
        return keyValues;
    }

    static clone(record: Record): Record {
        const target = <Record>Object.create(record);
        target.id = StringUtil.generateUID();
        target.headers = target.headers.map(h => HeaderService.clone(h));
        target.createDate = new Date();
        return target;
    }

    static async getByCollectionIds(collectionIds: string[], excludeFolder?: boolean, needHistory?: boolean): Promise<{ [key: string]: Record[] }> {
        if (!collectionIds || collectionIds.length === 0) {
            return {};
        }
        const connection = await ConnectionManager.getInstance();

        const parameters: ObjectLiteral = {};
        const whereStrings = collectionIds.map((id, index) => {
            parameters[`id_${index}`] = id;
            return `collection.id=:id_${index}`;
        });
        const whereStr = whereStrings.length > 1 ? '(' + whereStrings.join(' OR ') + ')' : whereStrings[0];

        let rep = connection.getRepository(Record).createQueryBuilder('record')
            .innerJoinAndSelect('record.collection', 'collection')
            .leftJoinAndSelect('record.headers', 'header')
            .leftJoinAndSelect('record.queryStrings', 'queryString')
            .leftJoinAndSelect('record.formDatas', 'formData')
            .where(whereStr, parameters);

        if (needHistory) {
            rep = rep.leftJoinAndSelect('record.history', 'history');
        }

        if (excludeFolder) {
            rep = rep.andWhere('category=:category', { category: RecordCategory.record });
        }

        let records = await rep.orderBy('record.name').getMany();

        if (needHistory) {
            const userDict = await UserService.getNameByIds(_.chain(records.map(r => r.history.map(h => h.userId))).flatten<string>().filter(r => !!r).uniq().value());
            records.forEach(r => r.history.forEach(h => h.user = userDict[h.userId]));
        }

        let recordsList = _.groupBy(records, o => o.collection.id);

        return recordsList;
    }

    static async getById(id: string, includeHeaders: boolean = false): Promise<Record> {
        const connection = await ConnectionManager.getInstance();
        let rep = connection.getRepository(Record).createQueryBuilder('record');
        if (includeHeaders) {
            rep = rep.leftJoinAndSelect('record.headers', 'header')
                .leftJoinAndSelect('record.queryStrings', 'queryString')
                .leftJoinAndSelect('record.formDatas', 'formData');
        }
        return await rep.where('record.id=:id', { id: id }).getOne();
    }

    static async getChildren(id: string, includeHeaders: boolean = false): Promise<Record[]> {
        const connection = await ConnectionManager.getInstance();
        let rep = connection.getRepository(Record).createQueryBuilder('record');
        if (includeHeaders) {
            rep = rep.leftJoinAndSelect('record.headers', 'header')
                .leftJoinAndSelect('record.queryStrings', 'queryString')
                .leftJoinAndSelect('record.formDatas', 'formData');
        }
        return await rep.where('record.pid=:pid', { pid: id }).getMany();
    }

    static async create(record: Record, user: User): Promise<ResObject> {
        record.sort = await this.getMaxSort();
        this.adjustAttachs(record.headers);
        this.adjustAttachs(record.formDatas);
        this.adjustAttachs(record.queryStrings);
        return await this.save(record, user);
    }

    static async update(record: Record, user: User): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();
        const recordInDB = await this.getById(record.id, true);

        if (recordInDB && recordInDB.headers.length > 0) {
            await connection.getRepository(Header).remove(recordInDB.headers);
        }
        this.adjustAttachs(record.headers);
        this.adjustAttachs(record.formDatas);
        this.adjustAttachs(record.queryStrings);
        return await this.save(record, user);
    }

    static async deleteFolder(id: string): Promise<ResObject> {
        const children = await RecordService.getChildren(id);
        children.forEach(async r => await RecordService.deleteRecord(r.id));
        return await RecordService.deleteRecord(id);
    }

    static async delete(id: string): Promise<ResObject> {
        const record = await RecordService.getById(id);
        if (record.category === RecordCategory.record) {
            return await RecordService.deleteRecord(id);
        } else {
            return await RecordService.deleteFolder(record.id);
        }
    }

    static async deleteRecord(id: string): Promise<ResObject> {
        await Promise.all([HeaderService.deleteForRecord(id), QueryStringService.deleteForRecord(id)]);

        const connection = await ConnectionManager.getInstance();
        await connection.transaction(async manager => {
            await RecordService.clearHistories(manager, id);
            await manager.createQueryBuilder(Record, 'record')
                .delete()
                .where('record.id=:id', { id: id })
                .execute();
        });
        return { success: true, message: Message.get('recordDeleteSuccess') };
    }

    private static adjustAttachs<T extends { id: string, sort: number }>(attachs: T[]) {
        if (!attachs) {
            return;
        }
        attachs.forEach((attach, index) => {
            attach.id = attach.id || StringUtil.generateUID();
            attach.sort = index;
        });
    }

    static async getMaxSort(): Promise<number> {
        const connection = await ConnectionManager.getInstance();
        const maxSortRecord = await connection.getRepository(Record)
            .createQueryBuilder('record')
            .addOrderBy('sort', 'DESC')
            .getOne();
        let maxSort = ++RecordService._sort;
        if (maxSortRecord && maxSortRecord.sort) {
            maxSort = Math.max(maxSort, maxSortRecord.sort + 1);
            RecordService._sort = maxSort;
        }
        return maxSort;
    }

    static async sort(recordId: string, folderId: string, collectionId: string, newSort: number): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();
        await connection.transaction(async manager => {
            await manager.query('update record r set r.sort = r.sort+1 where r.sort >= ? and r.collectionId = ? and pid = ?', [newSort, collectionId, folderId]);
            await manager.createQueryBuilder(Record, 'record')
                .where('record.id=:id', { 'id': recordId })
                .update(Record, { 'collectionId': collectionId, 'pid': folderId, 'sort': newSort })
                .execute();
        });
        return { success: true, message: Message.get('recordSortSuccess') };
    }

    private static async save(record: Record, user: User): Promise<ResObject> {
        if (!record.name) {
            return { success: false, message: Message.get('recordCreateFailedOnName') };
        }
        if (!record.id) {
            record.id = StringUtil.generateUID();
        }
        const connection = await ConnectionManager.getInstance();
        await connection.transaction(async manager => {
            await manager.save(record);
            if (record.category === RecordCategory.record) {
                await manager.save(RecordService.createRecordHistory(record, user));
            }
        });
        return { success: true, message: Message.get('recordSaveSuccess') };
    }

    private static toTree(records: Record[], parent?: Record, pushedRecord?: Array<string>): Record[] {
        let result = new Array<Record>();
        let nonParentRecord = new Array<Record>();
        pushedRecord = pushedRecord || new Array<string>();
        const pushChild = (r, p) => {
            p.children = p.children || [];
            p.children.push(r);
        };

        records.forEach(r => {
            if (r.category === RecordCategory.folder) {
                if (!r.pid && !parent) {
                    result.push(r);
                    pushedRecord.push(r.id);
                    RecordService.toTree(records, r, pushedRecord);
                } else if (parent && r.pid === parent.id) {
                    pushChild(r, parent);
                    pushedRecord.push(r.id);
                    RecordService.toTree(records, r, pushedRecord);
                }
            } else if (parent && r.pid === parent.id) {
                pushChild(r, parent);
            } else if (!parent && !r.pid) {
                nonParentRecord.push(r);
            }
        });

        result.push(...nonParentRecord);

        return result;
    }

    static async saveRecordHistory(history: RecordHistory) {
        const connection = await ConnectionManager.getInstance();
        await connection.manager.save(history);
    }

    static createRecordHistory(record: Record, user: User): RecordHistory {
        const history = new RecordHistory();
        history.target = record;
        history.user = user;
        history.record = { ...record };
        Reflect.deleteProperty(history.record, 'collection');
        Reflect.deleteProperty(history.record, 'doc');
        Reflect.deleteProperty(history.record, 'history');
        Reflect.deleteProperty(history.record, 'children');
        history.record.headers = record.headers.map(h => {
            const header = { ...h };
            Reflect.deleteProperty(header, 'record');
            return header;
        });
        return history;
    }

    private static async clearHistories(manager: EntityManager, rid: string): Promise<any> {
        await manager.createQueryBuilder(RecordHistory, 'recordHistory')
            .where('targetId=:rid', { rid })
            .delete()
            .execute();
    }

    static async combineScript(record: Record): Promise<Record> {
        const { globalFunction } = (await ProjectService.getProjectByCollectionId(record.collection.id)) || { globalFunction: '' };
        const commonPreScript = record.collection ? record.collection.commonPreScript : '';

        const prescript = `
            ${globalFunction || ''};
            ${commonPreScript || ''};
            ${record.prescript || ''};
        `;

        const test = `
            ${globalFunction || ''};
            ${record.test || ''};
        `;

        return {
            ...record,
            prescript,
            test
        };
    }

    static async prepareRecordsForRun(records: Record[], envId: string, orderIds?: string, trace?: (msg: string) => void): Promise<RecordEx[]> {
        const vid = StringUtil.generateUID();
        const env = await EnvironmentService.get(envId, true);
        const envName = env ? env.name : '';
        const envVariables = {};
        (env.variables || []).filter(v => v.isActive).forEach(v => envVariables[v.key] = v.value);

        let recordExs: RecordEx[] = [];

        for (let r of records) {
            let newRecord = { ...(await RecordService.combineScript(r)) };
            const { id: pid } = (await ProjectService.getProjectByCollectionId(r.collection.id)) || { id: '' };
            newRecord = await VariableService.applyVariableForRecord(envId, newRecord);
            recordExs.push({ ...newRecord, pid, envId, envName, envVariables, vid, param: '', trace });
        }

        recordExs = _.sortBy(recordExs, 'name');
        const recordDict = _.keyBy(recordExs, 'id');
        const orderRecords = (orderIds || '').split(';').map(i => i.includes(':') ? i.substr(0, i.length - 2) : i).filter(r => recordDict[r]).map(r => recordDict[r]);
        return _.unionBy(orderRecords, recordExs, 'id');
    }
}