import { ResObject } from '../common/res_object';
import { Connection } from 'typeorm';
import { Collection } from '../models/collection';
import { Environment } from '../models/environment';
import { Team } from '../models/team';
import { User } from '../models/user';
import { ConnectionManager } from "./connectionManager";
import { ObjectLiteral } from "typeorm/common/ObjectLiteral";

export class CollectionService {

    static async create(name: string, desc: string): Promise<ResObject> {
        let collection = new Collection(name, desc);
        await collection.save();
        return { success: true, message: '' };
    }

    static async getOwns(userId: string): Promise<Collection[]> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(Collection)
            .createQueryBuilder("collection")
            .innerJoinAndSelect('collection.team', 'team')
            .innerJoinAndSelect('collection.owner', 'owner')
            .where('recycle = 0')
            .setParameter('id', userId)
            .getMany();
    }

    static async getByIds(ids: string[]): Promise<Collection[]> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(Collection)
            .createQueryBuilder("collection")
            .innerJoinAndSelect('collection.team', 'team')
            .innerJoinAndSelect('collection.owner', 'owner')
            .where('recycle = 0')
            .andWhereInIds(ids)
            .getMany();
    }

    static async getByTeamId(teamid: string): Promise<Collection[]> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(Collection)
            .createQueryBuilder("collection")
            .innerJoinAndSelect('collection.team', 'team', 'team.id=:id')
            .innerJoinAndSelect('collection.owner', 'owner')
            .where('recycle = 0')
            .setParameter('id', teamid)
            .getMany();
    }

    static async getByTeamIds(teamIds: string[]): Promise<Collection[]> {
        const connection = await ConnectionManager.getInstance();
        const parameters: ObjectLiteral = {};
        const whereStrs = teamIds.map((id, index) => {
            parameters[`id_${index}`] = id;
            return `team.id=:id_${index}`;
        });
        const whereStr = whereStrs.length > 1 ? "(" + whereStrs.join(" OR ") + ")" : whereStrs[0];

        return await connection.getRepository(Collection)
            .createQueryBuilder("collection")
            .innerJoinAndSelect('collection.team', 'team')
            .innerJoinAndSelect('collection.owner', 'owner')
            .where('recycle = 0')
            .andWhere(whereStr, parameters)
            .getMany();
    }
}