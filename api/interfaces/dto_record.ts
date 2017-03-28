import { DtoHeader } from "./dto_header";

export interface DtoRecord {

    id: string;

    collectionId: string;

    pid: string;

    name: string;

    url: string;

    method: string;

    headers: DtoHeader[];

    body: string;

    test: string;

    sort: number;
}