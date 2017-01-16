import { createConnection } from 'typeorm';
import { connectionOptions } from './dbConfig';
import { Collection } from '../models/collection';

export class CaseService
{
    static getAll(userId : string){
        createConnection(connectionOptions).then(async collection =>
        {
            return await collection.getRepository(Collection)
                            .createQueryBuilder("collection")
                            .where(`collection.owner = ${userId}`)
                            .getMany();
        }).catch(error => console.log(error));
    }
}