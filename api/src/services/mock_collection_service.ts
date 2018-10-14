import { ResObject } from '../interfaces/res_object';
import { ConnectionManager } from './connection_manager';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { User } from '../models/user';
import { Message } from '../utils/message';
import { StringUtil } from '../utils/string_util';
import { Project } from '../models/project';
import { MockCollection } from '../models/mock_collection';
import { DtoMockCollection } from '../common/interfaces/dto_mock_collection';
import { MockService } from './mock_service';

export class MockCollectionService {

    static async save(collection: MockCollection) {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(MockCollection).save(collection);
    }

    static clone(collection: MockCollection): MockCollection {
        const target = <MockCollection>Object.create(collection);
        target.id = StringUtil.generateUID();
        target.mocks = target.mocks.map(r => MockService.clone(r));
        target.createDate = new Date();
        return target;
    }

    static fromDto(dtoCollection: DtoMockCollection): MockCollection {
        const collection = new MockCollection();
        collection.id = dtoCollection.id || StringUtil.generateUID();
        collection.name = dtoCollection.name;
        collection.description = dtoCollection.description;
        collection.headers = dtoCollection.headers;
        collection.project = new Project();
        collection.project.id = dtoCollection.projectId;
        collection.mocks = [];
        return collection;
    }

    static toDto(collection: MockCollection): DtoMockCollection {
        return <DtoMockCollection>{ ...collection, projectId: collection.project.id };
    }

    static async create(dtoCollection: DtoMockCollection, userId: string): Promise<ResObject> {
        const owner = new User();
        owner.id = userId;

        const collection = this.fromDto(dtoCollection);
        collection.owner = owner;

        await this.save(collection);
        return { success: true, message: Message.get('collectionCreateSuccess') };
    }

    static async update(dtoCollection: DtoMockCollection): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();

        await connection.getRepository(MockCollection)
            .update({ id: dtoCollection.id }, {
                name: dtoCollection.name,
                description: dtoCollection.description,
                headers: dtoCollection.headers
            });
        return { success: true, message: Message.get('collectionUpdateSuccess') };
    }

    static async delete(id: string): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();

        await connection.getRepository(MockCollection)
            .createQueryBuilder('collection')
            .where('id=:id', { id })
            .update({ recycle: true })
            .execute();
        return { success: true, message: Message.get('collectionDeleteSuccess') };
    }

    static async getOwns(userId: string): Promise<MockCollection[]> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(MockCollection)
            .createQueryBuilder('collection')
            .leftJoinAndSelect('collection.project', 'project')
            .leftJoinAndSelect('collection.owner', 'owner')
            .where('recycle = 0')
            .andWhere('owner.id = :userId')
            .orderBy('collection.name')
            .setParameter('userId', userId)
            .getMany();
    }

    static async getById(id: string, needMocks: boolean = false): Promise<MockCollection> {
        const connection = await ConnectionManager.getInstance();

        let rep = connection.getRepository(MockCollection)
            .createQueryBuilder('collection')
            .leftJoinAndSelect('collection.project', 'project')
            .leftJoinAndSelect('collection.owner', 'owner');

        if (needMocks) {
            rep = rep.leftJoinAndSelect('collection.mocks', 'mocks');
        }

        return await rep.where('recycle = 0')
            .andWhere('collection.id = :id')
            .setParameter('id', id)
            .getOne();
    }

    static async getByIds(ids: string[]): Promise<MockCollection[]> {
        if (!ids || ids.length === 0) {
            return [];
        }

        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(MockCollection)
            .createQueryBuilder('collection')
            .leftJoinAndSelect('collection.project', 'project')
            .leftJoinAndSelect('collection.owner', 'owner')
            .where('recycle = 0')
            .andWhereInIds(ids.map(id => ({ id })))
            .getMany();
    }

    static async getByProjectId(projectid: string): Promise<MockCollection[]> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(MockCollection)
            .createQueryBuilder('collection')
            .innerJoinAndSelect('collection.project', 'project', 'project.id=:id')
            .leftJoinAndSelect('collection.owner', 'owner')
            .where('recycle = 0')
            .setParameter('id', projectid)
            .getMany();
    }

    static async getByProjectIds(projectIds: string[]): Promise<MockCollection[]> {
        if (!projectIds || projectIds.length === 0) {
            return [];
        }

        const connection = await ConnectionManager.getInstance();
        const parameters: ObjectLiteral = {};
        const whereStrings = projectIds.map((id, index) => {
            parameters[`id_${index}`] = id;
            return `project.id=:id_${index}`;
        });
        const whereStr = whereStrings.length > 1 ? '(' + whereStrings.join(' OR ') + ')' : whereStrings[0];

        return await connection.getRepository(MockCollection)
            .createQueryBuilder('collection')
            .innerJoinAndSelect('collection.project', 'project')
            .leftJoinAndSelect('collection.owner', 'owner')
            .where('recycle = 0')
            .andWhere(whereStr, parameters)
            .orderBy('collection.name')
            .getMany();
    }
}