import { DtoRecord } from './dto_record';

export interface DtoCollection {

    id: string;

    name: string;

    commonPreScript: string;

    reqStrictSSL?: boolean;

    reqFollowRedirect?: boolean;

    projectId: string;

    description: string;
}

export interface DtoCollectionWithRecord {

    collections: _.Dictionary<DtoCollection>;

    records: _.Dictionary<_.Dictionary<DtoRecord>>;
}