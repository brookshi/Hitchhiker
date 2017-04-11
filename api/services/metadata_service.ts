import { PostmanCollectionV1 } from "../interfaces/postman_v1";
import { MetadataType } from "../common/metadata_type";
import { Collection } from "../models/collection";
import { Record } from "../models/record";
import { DtoCollection } from "../interfaces/dto_collection";
import { User } from "../models/user";
import { Team } from "../models/team";
import { DtoRecord } from "../interfaces/dto_record";
import { RecordService } from "./record_service";

export class MetadataService {
    static async convertPostmanCollectionV1(owner: User, teamId: string, data: PostmanCollectionV1): Promise<Collection> {
        let sort = await RecordService.getMaxSort();
        const dtoCollection = <DtoCollection>data;
        const collection = Collection.fromDto(dtoCollection);

        collection.owner = owner;
        collection.team = new Team(teamId);

        data.folders.forEach(f => {
            const dtoRecord = <DtoRecord>f;
            dtoRecord.sort = sort++;
            collection.records.push(Record.fromDto(dtoRecord));
        });

        return collection;
    }

    static getMetadataCategory(data: any): MetadataType {
        if (data.version && data.version === 1) {
            return MetadataType.PostmanAllV1;
        }
        else if (data.item) {
            return MetadataType.PostmanCollectionV2;
        }
        else {
            return MetadataType.PostmanCollectionV1;
        }
    }
}