import { RecordService } from './recordService';
import { Connection } from 'typeorm';
import { ConnectionManager } from "./connectionManager";
import { CollectionService } from "./collectionService";
import { UserService } from "./userService";
import { Collection } from "../models/collection";
import { User } from "../models/user";
import { Team } from "../models/team";
import { TeamService } from "./teamService";
import * as _ from "lodash";

export class UserCollectionService {

    static async getUserCollections(userId: string): Promise<Collection[]> {
        let collectionArr = await Promise.all([CollectionService.getOwns(userId), UserCollectionService.getUserTeamCollections(userId)]);

        let collections = <Collection[]>_.unionWith(collectionArr[0], collectionArr[1], (a, b) => (<Collection>a).id == (<Collection>b).id);

        const collectionIds = collections.map(o => o.id);
        const records = await RecordService.getByCollectionIds(collectionIds);

        collections.forEach(o => o.records = records[o.id]);

        return collections;
    }

    static async getUserTeamCollections(userId: string): Promise<Collection[]> {
        const user = await UserService.getUserById(userId);

        if (!user) {
            return null;
        }

        const teamIds = user.teams.map(t => t.id);

        return await CollectionService.getByTeamIds(teamIds);
    }
}