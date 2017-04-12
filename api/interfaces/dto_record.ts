import { DtoHeader } from "./dto_header";
import { RecordCategory } from "../common/record_category";

export interface DtoRecord {

    id: string;

    collectionId: string;

    pid: string;

    category: RecordCategory;

    name: string;

    url: string;

    method: string;

    headers: DtoHeader[] | string;

    body: string;

    test: string;

    sort: number;
}