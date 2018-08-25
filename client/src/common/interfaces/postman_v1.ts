import { DtoRecord } from './dto_record';
import { DtoEnvironment } from './dto_environment';
import { DtoVariable } from './dto_variable';
import { DataMode } from '../enum/data_mode';

export interface PostmanAllV1 {

    collections: PostmanCollectionV1[];

    environments: PostmanEnvironments[];
}

export interface PostmanCollectionV1 {

    id: string;

    name: string;

    description: string;

    commonPreScript: string;

    folders: PostmanRecord[];

    requests: PostmanRecord[];
}

export interface PostmanRecord extends DtoRecord {

    tests: string;

    folder: string;

    rawModeData: string;

    dataMode: DataMode & string;

    data: any;

    preRequestScript: string;

    order: string[];
}

export interface PostmanEnvironments extends DtoEnvironment {

    values: PostmanEnv[];
}

export interface PostmanEnv extends DtoVariable {

    enabled: boolean;

    type: string;
}