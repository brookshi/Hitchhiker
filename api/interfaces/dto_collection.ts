import { DtoRecord } from './dto_record';
import { DtoHeader } from './dto_header';

export interface DtoCollection {

    id: string;

    name: string;

    commonPreScript: string;

    reqStrictSSL?: boolean;

    reqFollowRedirect?: boolean;

    projectId: string;

    commonSetting: DtoCommonSetting;

    description: string;
}

export interface DtoCommonSetting {

    prescript: string;

    test: string;

    headers: DtoHeader[];
}

export interface DtoCollectionWithRecord {

    collections: _.Dictionary<DtoCollection>;

    records: _.Dictionary<_.Dictionary<DtoRecord>>;
}