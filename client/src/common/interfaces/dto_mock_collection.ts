import { DtoHeader } from './dto_header';
import * as _ from 'lodash';
import { DtoMock } from './dto_mock';

export interface DtoMockCollection {

    id: string;

    name: string;

    projectId: string;

    headers: DtoHeader[];

    description: string;
}

export interface DtoCollectionWithMock {

    collections: _.Dictionary<DtoMockCollection>;

    mocks: _.Dictionary<_.Dictionary<DtoMock>>;
}