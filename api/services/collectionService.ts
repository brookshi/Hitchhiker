import { createConnection } from 'typeorm';
import { connectionOptions } from './dbConfig';
import { Collection } from '../models/collection';
import { Environment } from '../models/environment';

export class CollectionService
{
    static getOwnCollections(userId : string, environment: Environment){
        createConnection(connectionOptions).then(async collection =>
        {
            return await collection.getRepository(Collection)
                            .createQueryBuilder("collection")
                            .where(`collection.owner = ${userId}`)
                            .where(`collection.environment = ${environment}`)
                            .getMany();
        }).catch(error => console.log(error));
    }

    static getTeamCollections(userId: string, environment: Environment){
        
    }
}