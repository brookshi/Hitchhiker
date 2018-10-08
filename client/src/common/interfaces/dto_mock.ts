import { DtoHeader } from './dto_header';
import { RecordCategory } from '../enum/record_category';
import { DtoQueryString, DtoBodyFormData } from './dto_variable';
import { DataMode } from '../enum/data_mode';

export interface DtoMock {

    id: string;

    collectionId: string;

    pid?: string;

    category: RecordCategory;

    name: string;

    url?: string;

    method?: string;

    queryStrings?: DtoQueryString[];

    formDatas?: DtoBodyFormData[];

    headers?: DtoHeader[];

    body?: string;

    dataMode?: DataMode;

    sort?: number;

    description?: string;

    children?: DtoMock[];
}