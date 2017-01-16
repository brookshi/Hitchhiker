import { createConnection } from 'typeorm';
import { connectionOptions } from './dbConfig';
import { Case } from '../models/case';

export class CaseService
{
    static add(caseItem : Case){
        createConnection(connectionOptions).then(async collection =>
        {
            await collection.getRepository(Case).persist(caseItem);
        }).catch(error => console.log(error));
    }
}