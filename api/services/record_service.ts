import { Record } from '../models/record';
import { ConnectionManager } from './connection_manager';
import { ObjectLiteral } from "typeorm/common/ObjectLiteral";
import * as _ from "lodash";
import { ResObject } from "../common/res_object";
import { Message } from "../common/message";

export class RecordService {
    static async getByCollectionIds(collectionIds: string[]): Promise<{ [key: string]: Record[] }> {
        const connection = await ConnectionManager.getInstance();

        const parameters: ObjectLiteral = {};
        const whereStrs = collectionIds.map((id, index) => {
            parameters[`id_${index}`] = id;
            return `collection.id=:id_${index}`;
        });
        const whereStr = whereStrs.length > 1 ? "(" + whereStrs.join(" OR ") + ")" : whereStrs[0];

        let records = await connection.getRepository(Record)
            .createQueryBuilder("record")
            .innerJoinAndSelect("record.collection", "collection")
            .innerJoinAndSelect('record.headers', 'header')
            .where(whereStr, parameters)
            .getMany();

        return _.groupBy(records, o => o.collection.id);
    }

    static async create(record: Record): Promise<ResObject> {
        return await RecordService.save(record);
    }

    static async update(record: Record): Promise<ResObject> {
        return await RecordService.save(record);
    }

    private static async save(record: Record): Promise<ResObject> {
        if (!record.name) {
            return { success: false, message: Message.recordCreateFailedOnName };
        }
        await record.save();
        return { success: true, message: '' };
    }
}