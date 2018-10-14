import { RecordService } from './record_service';
import { CollectionService } from './collection_service';
import { UserService } from './user_service';
import { Collection } from '../models/collection';
import { Record } from '../models/record';
import { MockService } from './mock_service';
import { MockCollection } from '../models/mock_collection';
import { MockCollectionService } from './mock_collection_service';
import { Mock } from '../models/mock';

export class UserCollectionService {

    static async getUserCollections(userId: string): Promise<{ collections: Collection[], recordsList: { [key: string]: Record[] } }> {

        let collections = await this.getUserProjectCollections(userId);

        const recordsList = await RecordService.getByCollectionIds(collections.map(o => o.id), false, true);

        return { collections, recordsList };
    }

    static async getUserMockCollections(userId: string): Promise<{ mockCollections: MockCollection[], mockList: { [key: string]: Mock[] } }> {

        let mockCollections = await this.getUserProjectMockCollections(userId);

        const mockList = await MockService.getByCollectionIds(mockCollections.map(o => o.id), false);

        return { mockCollections, mockList };
    }

    static async getUserProjectCollections(userId: string): Promise<Collection[]> {
        const user = await UserService.getUserById(userId, true);

        if (!user) {
            return [];
        }

        const projectIds = user.projects.map(t => t.id);

        return await CollectionService.getByProjectIds(projectIds);
    }

    static async getUserProjectMockCollections(userId: string): Promise<MockCollection[]> {
        const user = await UserService.getUserById(userId, true);

        if (!user) {
            return [];
        }

        const projectIds = user.projects.map(t => t.id);

        return await MockCollectionService.getByProjectIds(projectIds);
    }
}