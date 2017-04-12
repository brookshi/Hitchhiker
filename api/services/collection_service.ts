import { ResObject } from '../common/res_object';
import { Collection } from '../models/collection';
import { ConnectionManager } from "./connection_manager";
import { ObjectLiteral } from "typeorm/common/ObjectLiteral";
import { User } from "../models/user";
import { Message } from "../common/message";
import { Team } from "../models/team";

export class CollectionService {

    static async create(name: string, desc: string, userId: string): Promise<ResObject> {
        const owner = new User();
        owner.id = userId;
        let collection = new Collection(name, desc, owner);
        await collection.save();
        return { success: true, message: Message.collectionCreateSuccess };
    }

    static async getOwns(userId: string): Promise<Collection[]> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(Collection)
            .createQueryBuilder("collection")
            .leftJoinAndSelect('collection.team', 'team')
            .leftJoinAndSelect('collection.owner', 'owner')
            .where('recycle = 0')
            .andWhere('owner.id = :userId')
            .setParameter('userId', userId)
            .getMany();
    }

    static async getById(id: string, needRecords: boolean = false): Promise<Collection> {
        const connection = await ConnectionManager.getInstance();

        let rep = connection.getRepository(Collection)
            .createQueryBuilder("collection")
            .leftJoinAndSelect('collection.team', 'team')
            .leftJoinAndSelect('collection.owner', 'owner');

        if (needRecords) {
            rep = rep.leftJoinAndSelect('collection.records', 'records');
        }

        return await rep.where('recycle = 0')
            .andWhere('collection.id = :id')
            .setParameter('id', id)
            .getOne();
    }

    static async getByIds(ids: string[]): Promise<Collection[]> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(Collection)
            .createQueryBuilder("collection")
            .leftJoinAndSelect('collection.team', 'team')
            .leftJoinAndSelect('collection.owner', 'owner')
            .where('recycle = 0')
            .andWhereInIds(ids)
            .getMany();
    }

    static async getByTeamId(teamid: string): Promise<Collection[]> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(Collection)
            .createQueryBuilder("collection")
            .innerJoinAndSelect('collection.team', 'team', 'team.id=:id')
            .leftJoinAndSelect('collection.owner', 'owner')
            .where('recycle = 0')
            .setParameter('id', teamid)
            .getMany();
    }

    static async getByTeamIds(teamIds: string[]): Promise<Collection[]> {
        if (teamIds) {
            return [];
        }

        const connection = await ConnectionManager.getInstance();
        const parameters: ObjectLiteral = {};
        const whereStrings = teamIds.map((id, index) => {
            parameters[`id_${index}`] = id;
            return `team.id=:id_${index}`;
        });
        const whereStr = whereStrings.length > 1 ? "(" + whereStrings.join(" OR ") + ")" : whereStrings[0];

        return await connection.getRepository(Collection)
            .createQueryBuilder("collection")
            .innerJoinAndSelect('collection.team', 'team')
            .leftJoinAndSelect('collection.owner', 'owner')
            .where('recycle = 0')
            .andWhere(whereStr, parameters)
            .getMany();
    }

    static async shareCollection(collectionId: string, teamId: string): Promise<ResObject> {
        const origin = await CollectionService.getById(collectionId, true);
        if (!origin) {
            return { success: false, message: Message.collectionNotExist };
        }

        const target = origin.clone();
        target.team = new Team(teamId);
        await origin.save();
    }
}