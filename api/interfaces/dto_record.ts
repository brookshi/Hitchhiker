import { DtoHeader } from "./dto_header";
import { RecordCategory } from "../common/record_category";
import { BodyType } from "../common/body_type";

export interface DtoRecord {

    id: string;

    collectionId?: string;

    pid?: string;

    category: RecordCategory;

    name: string;

    url?: string;

    method?: string;

    headers?: DtoHeader[] | string;

    body?: string;

    bodyType?: BodyType;

    test?: string;

    sort?: number;
}