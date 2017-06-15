import { RecordService } from './record_service';
import { CollectionService } from "./collection_service";
import { UserService } from "./user_service";
import { Collection } from "../models/collection";
import { Record } from '../models/record';
import * as _ from "lodash";

export class UserCollectionService {

    static async getUserCollections(userId: string): Promise<{ collections: Collection[], recordsList: { [key: string]: Record[] } }> {
        let collections = await UserCollectionService.getUserTeamCollections(userId);

        const recordsList = await RecordService.getByCollectionIds(collections.map(o => o.id), true);

        // collections.forEach(o => o.records = recordsList[o.id]);

        return { collections, recordsList };
    }

    static async getUserTeamCollections(userId: string): Promise<Collection[]> {
        const user = await UserService.getUserById(userId, true);

        if (!user) {
            return [];
        }

        const teamIds = user.teams.map(t => t.id);

        return await CollectionService.getByTeamIds(teamIds);
    }
}