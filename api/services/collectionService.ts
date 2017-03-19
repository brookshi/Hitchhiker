import { Connection } from 'typeorm';
import { Collection } from '../models/collection';
import { Environment } from '../models/environment';
import { Team } from '../models/team';
import { User } from '../models/user';
import { ConnectionManager } from "./connectionManager";

export class CollectionService {

    static async getCollections(userId: string, env: string) {
        ConnectionManager.getInstance().then(async connection => {
            var collection = await Promise.all([this.getOwnCollections(connection, userId, env), this.getTeamCollections(connection, userId, env)]);

            if (collection[1]) {
                collection[1].forEach(c => {
                    if (!collection[0].find(v => v.id === c.id)) {
                        collection[1].push(c);
                    }
                });
            }

            return collection[0];
        }).catch(error => console.log(error));
    }

    static async getTeamCollections(connection: Connection, userId: string, env: string): Promise<Collection[]> {
        var user = await connection.getRepository(User)
            .createQueryBuilder("user")
            .innerJoinAndSelect('user.teams', 'team')
            .where(`user.id = :id`)
            .setParameter('id', userId)
            .getOne();

        if (!user) {
            return undefined;
        }

        let teamIds = [];
        user.teams.forEach(t => {
            teamIds.push(t.id);
        });

        let teams = await connection.getRepository(Team)
            .createQueryBuilder('team')
            .innerJoinAndSelect('team.collections', 'collection')
            .where('1=1')
            .andWhereInIds(teamIds)
            .
            .getMany();

        let collections = new Array<Collection>();
        teams.forEach(team => collections.push(...team.collections));

        return collections.filter(c => c.environment.name === env);
    }

    static async getOwnCollections(connection: Connection, userId: string, env: string): Promise<Collection[]> {
        return await connection.getRepository(Collection)
            .createQueryBuilder("collection")
            .where(`collection.owner = :id`)
            .innerJoinAndSelect('collection.environment', 'env', 'env.name = :environment')
            .setParameter('environment', env)
            .setParameter('id', userId)
            .getMany();
    }
}