import { DtoRecord } from "./dto_record";

export interface PostmanAllV1 {
    collections: PostmanCollectionV1[];

    environments: PostmanEnvironments[];
}

export interface PostmanCollectionV1 {

    id: string;

    name: string;

    description: string;

    folders: PostmanRecord[];

    requests: PostmanRecord[];
}


export interface PostmanRecord extends DtoRecord {

    tests: string;

    folder: string;

    rawModeData: string;

    data: string;
}

export interface PostmanEnvironments {
    id: string;

    name: string;

    values: PostmanEnv[];
}

export interface PostmanEnv {
    enabled: boolean;

    key: string;

    value: string;

    type: string;
}