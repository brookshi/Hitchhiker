import { Connection } from 'typeorm';
import { Collection } from '../models/collection';
import { Environment } from '../models/environment';
import { Team } from '../models/team';
import { User } from '../models/user';
import { ConnectionManager } from "./connectionManager";
import { ObjectLiteral } from "typeorm/common/ObjectLiteral";

export class CollectionService {

    static async getOwnCollections(userId: string, env: string): Promise<Collection[]> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(Collection)
            .createQueryBuilder("collection")
            .innerJoinAndSelect('collection.environment', 'env', 'env.name = :environment')
            .innerJoinAndSelect('collection.team', 'team')
            .innerJoinAndSelect('collection.owner', 'owner')
            .where('recycle = 0')
            .setParameter('environment', env)
            .setParameter('id', userId)
            .getMany();
    }

    static async getCollections(ids: string[], env: string): Promise<Collection[]> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(Collection)
            .createQueryBuilder("collection")
            .innerJoinAndSelect('collection.environment', 'env', 'env.name = :environment')
            .innerJoinAndSelect('collection.team', 'team')
            .innerJoinAndSelect('collection.owner', 'owner')
            .where('recycle = 0')
            .andWhereInIds(ids)
            .setParameter('environment', env)
            .getMany();
    }

    static async getTeamCollections(teamid: string, env: string): Promise<Collection[]> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(Collection)
            .createQueryBuilder("collection")
            .innerJoinAndSelect('collection.environment', 'env', 'env.name = :environment')
            .innerJoinAndSelect('collection.team', 'team', 'team.id=:id')
            .innerJoinAndSelect('collection.owner', 'owner')
            .where('recycle = 0')
            .setParameter('id', teamid)
            .setParameter('environment', env)
            .getMany();
    }

    static async getTeamsCollections(teamIds: string[], env: string): Promise<Collection[]> {
        const connection = await ConnectionManager.getInstance();
        const parameters: ObjectLiteral = {};
        const whereStrs = teamIds.map((id, index) => {
            parameters[`id_${index}`] = id;
            return `team.id=:id_${index}`;
        });
        const whereStr = whereStrs.length > 1 ? "(" + whereStrs.join(" OR ") + ")" : whereStrs[0];

        return await connection.getRepository(Collection)
            .createQueryBuilder("collection")
            .innerJoinAndSelect('collection.environment', 'env', 'env.name = :environment')
            .innerJoinAndSelect('collection.team', 'team')
            .innerJoinAndSelect('collection.owner', 'owner')
            .where('recycle = 0')
            .andWhere(whereStr, parameters)
            .setParameter('environment', env)
            .getMany();
    }
}