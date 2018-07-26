import { CollectionService } from './collection_service';
import { User } from '../models/user';
import { EnvironmentService } from './environment_service';
import { DtoEnvironment } from '../interfaces/dto_environment';
import { StringUtil } from '../utils/string_util';
import { RecordService } from './record_service';
import { PostmanImport } from './importer/postman_import';
import * as _ from 'lodash';

export class SampleService {

    private static sampleCollection: any;

    private static init() {
        if (!!SampleService.sampleCollection) {
            return;
        }
        SampleService.sampleCollection = require('../../sample collection.json');
    }

    static async createSampleForUser(owner: User, projectId: string) {

        SampleService.init();

        const collection = await new PostmanImport().parsePostmanCollectionV1(owner, projectId, _.cloneDeep(SampleService.sampleCollection));

        await CollectionService.save(collection);

        await Promise.all(collection.records.map(r => RecordService.saveRecordHistory(RecordService.createRecordHistory(r, owner))));

        const dtoEnv: DtoEnvironment = { id: StringUtil.generateUID(), name: 'Sample Env', project: { id: projectId }, variables: [{ id: StringUtil.generateUID(), key: 'apihost', value: 'http://httpbin.org', isActive: true, sort: 0 }, { id: StringUtil.generateUID(), key: 'string', value: 'test', isActive: true, sort: 1 }] };

        await EnvironmentService.create(dtoEnv);
    }
}