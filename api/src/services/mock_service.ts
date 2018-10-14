import { ConnectionManager } from './connection_manager';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import * as _ from 'lodash';
import { ResObject } from '../interfaces/res_object';
import { Message } from '../utils/message';
import { Header } from '../models/header';
import { RecordCategory } from '../common/enum/record_category';
import { HeaderService } from './header_service';
import { StringUtil } from '../utils/string_util';
import { QueryStringService } from './query_string_service';
import { FormDataService } from './form_data_service';
import { QueryString } from '../models/query_string';
import { BodyFormData } from '../models/body_form_data';
import { Mock } from '../models/mock';
import { DtoMock } from '../common/interfaces/dto_mock';
import { MockCollection } from '../models/mock_collection';
import { FuncUtil } from '../utils/func_util';
import { MockMode } from '../common/enum/mock_mode';
import * as Mockjs from 'mockjs';

export class MockService {
    private static _sort: number = 0;

    static fromDto(target: DtoMock): Mock {
        let collection = new MockCollection();
        collection.id = target.collectionId;

        let mock = new Mock();
        mock.id = target.id;
        mock.url = target.url;
        mock.pid = target.pid;
        mock.body = target.body || '';
        mock.headers = this.handleArray(target.headers, mock.id, HeaderService.fromDto);
        mock.sort = target.sort;
        mock.mode = target.mode;
        mock.method = target.method;
        mock.collection = collection;
        mock.name = target.name;
        mock.description = target.description;
        mock.category = target.category;
        mock.dataMode = target.dataMode;
        mock.res = target.res;
        mock.queryStrings = this.handleArray(target.queryStrings, mock.id, QueryStringService.fromDto);
        mock.formDatas = this.handleArray(target.formDatas, mock.id, FormDataService.fromDto);
        return mock;
    }

    private static handleArray<TTarget extends { mock?: Mock }, TDTO>(dtos: TDTO[] | any, id: string, fromDto: (o: TDTO) => TTarget) {
        if (dtos instanceof Array) {
            return dtos.map(o => {
                let target = fromDto(o);
                return this.setMockForChild(target, id);
            });
        }
    }

    private static setMockForChild<T extends { mock?: Mock }>(child: T, id: string) {
        child.mock = new Mock();
        child.mock.id = id;
        return child;
    }

    static toDto(target: Mock): DtoMock {
        return <DtoMock><any>{ ...target, collectionId: target.collection.id };
    }

    static clone(mock: Mock): Mock {
        const target = <Mock>Object.create(mock);
        target.id = StringUtil.generateUID();
        target.headers = target.headers.map(h => HeaderService.clone(h));
        target.queryStrings = target.queryStrings.map(h => QueryStringService.clone(h));
        target.formDatas = target.formDatas.map(h => FormDataService.clone(h));
        target.createDate = new Date();
        return target;
    }

    static async getByCollectionIds(collectionIds: string[], excludeFolder?: boolean): Promise<{ [key: string]: Mock[] }> {
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

        let rep = connection.getRepository(Mock).createQueryBuilder('mock')
            .innerJoinAndSelect('mock.collection', 'collection')
            .leftJoinAndSelect('mock.headers', 'header')
            .leftJoinAndSelect('mock.queryStrings', 'queryString')
            .leftJoinAndSelect('mock.formDatas', 'formData')
            .where(whereStr, parameters);

        if (excludeFolder) {
            rep = rep.andWhere('category=:category', { category: RecordCategory.record });
        }

        let mocks = await rep.orderBy('mock.name').getMany();

        let mockList = _.groupBy(mocks, o => o.collection.id);

        return mockList;
    }

    static async getById(id: string, includeHeaders: boolean = false): Promise<Mock> {
        const connection = await ConnectionManager.getInstance();
        let rep = connection.getRepository(Mock).createQueryBuilder('mock');
        if (includeHeaders) {
            rep = rep.leftJoinAndSelect('mock.headers', 'header')
                .leftJoinAndSelect('mock.queryStrings', 'queryString')
                .leftJoinAndSelect('mock.formDatas', 'formData');
        }
        return await rep.where('mock.id=:id', { id: id }).getOne();
    }

    static async getChildren(id: string, includeHeaders: boolean = false): Promise<Mock[]> {
        const connection = await ConnectionManager.getInstance();
        let rep = connection.getRepository(Mock).createQueryBuilder('mock');
        if (includeHeaders) {
            rep = rep.leftJoinAndSelect('mock.headers', 'header')
                .leftJoinAndSelect('mock.queryStrings', 'queryString')
                .leftJoinAndSelect('mock.formDatas', 'formData');
        }
        return await rep.where('mock.pid=:pid', { pid: id }).getMany();
    }

    static async create(mock: Mock): Promise<ResObject> {
        mock.sort = await this.getMaxSort();
        FuncUtil.adjustAttachs(mock.headers);
        FuncUtil.adjustAttachs(mock.formDatas);
        FuncUtil.adjustAttachs(mock.queryStrings);
        return await this.save(mock);
    }

    static async update(mock: Mock): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();
        const mockInDB = await this.getById(mock.id, true);

        if (mockInDB) {
            if ((mockInDB.headers || []).length > 0) {
                await connection.getRepository(Header).remove(mockInDB.headers);
            }
            if ((mockInDB.queryStrings || []).length > 0) {
                await connection.getRepository(QueryString).remove(mockInDB.queryStrings);
            }
            if ((mockInDB.formDatas || []).length > 0) {
                await connection.getRepository(BodyFormData).remove(mockInDB.formDatas);
            }
        }
        FuncUtil.adjustAttachs(mock.headers);
        FuncUtil.adjustAttachs(mock.formDatas);
        FuncUtil.adjustAttachs(mock.queryStrings);
        return await this.save(mock);
    }

    static async deleteFolder(id: string): Promise<ResObject> {
        const children = await this.getChildren(id);
        children.forEach(async r => await this.deleteMock(r.id));
        return await this.deleteMock(id);
    }

    static async delete(id: string): Promise<ResObject> {
        const mock = await this.getById(id);
        if (mock.category === RecordCategory.record) {
            return await this.deleteMock(id);
        } else {
            return await this.deleteFolder(mock.id);
        }
    }

    static async deleteMock(id: string): Promise<ResObject> {
        await Promise.all([
            HeaderService.deleteForHost('mock', id),
            QueryStringService.deleteForHost('mock', id),
            FormDataService.deleteForHost('mock', id)
        ]);

        const connection = await ConnectionManager.getInstance();
        await connection.createQueryBuilder(Mock, 'mock')
            .delete()
            .where('mock.id=:id', { id: id })
            .execute();

        return { success: true, message: Message.get('recordDeleteSuccess') };
    }

    static async getMaxSort(): Promise<number> {
        const connection = await ConnectionManager.getInstance();
        const data = await connection.getRepository(Mock)
            .query('select sort from mock order by sort desc limit 1');
        let maxSort = ++this._sort;
        if (data && data[0] && data[0].sort) {
            maxSort = Math.max(maxSort, data[0].sort + 1);
            this._sort = maxSort;
        }
        return maxSort;
    }

    static async sort(mockId: string, folderId: string, collectionId: string, newSort: number): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();
        await connection.transaction(async manager => {
            await manager.query('update mock r set r.sort = r.sort+1 where r.sort >= ? and r.collectionId = ? and pid = ?', [newSort, collectionId, folderId]);
            await manager.createQueryBuilder(Mock, 'mock')
                .where('mock.id=:id', { 'id': mockId })
                .update(Mock, { 'collectionId': collectionId, 'pid': folderId, 'sort': newSort })
                .execute();
        });
        return { success: true, message: Message.get('recordSortSuccess') };
    }

    private static async save(mock: Mock): Promise<ResObject> {
        if (!mock.name) {
            return { success: false, message: Message.get('recordCreateFailedOnName') };
        }
        if (!mock.id) {
            mock.id = StringUtil.generateUID();
        }

        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(Mock).save(mock);
        return { success: true, message: Message.get('recordSaveSuccess') };
    }

    private static toTree(mocks: Mock[], parent?: Mock, pushedMock?: Array<string>): Mock[] {
        let result = new Array<Mock>();
        let nonParentMock = new Array<Mock>();
        pushedMock = pushedMock || new Array<string>();
        const pushChild = (r, p) => {
            p.children = p.children || [];
            p.children.push(r);
        };

        mocks.forEach(r => {
            if (r.category === RecordCategory.folder) {
                if (!r.pid && !parent) {
                    result.push(r);
                    pushedMock.push(r.id);
                    this.toTree(mocks, r, pushedMock);
                } else if (parent && r.pid === parent.id) {
                    pushChild(r, parent);
                    pushedMock.push(r.id);
                    this.toTree(mocks, r, pushedMock);
                }
            } else if (parent && r.pid === parent.id) {
                pushChild(r, parent);
            } else if (!parent && !r.pid) {
                nonParentMock.push(r);
            }
        });

        result.push(...nonParentMock);

        return result;
    }

    static deleteMockForCascade<T extends object>(cascades: T[]) {
        return (cascades || []).map(c => {
            const cascade = Object.assign({}, c);
            Reflect.deleteProperty(cascade, 'mock');
            return cascade;
        });
    }

    static async getMockRes(method: string, url: string): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();
        const mocks = await connection.getRepository(Mock)
            .createQueryBuilder('mock')
            .where('mock.method=:method', { method })
            .where('mock.url=:url', { url })
            .orderBy('updateDate', 'DESC')
            .getMany();

        if (mocks.length === 0) {
            return { success: false, message: 'can not find api which match this method and url' };
        }

        const mock = mocks[0];
        if (mock.mode === MockMode.nativelData) {
            return { success: true, message: '', result: mock.res };
        }

        return { success: true, message: '', result: Mockjs.mock(mock.res) };
    }
}