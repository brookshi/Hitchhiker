import { DtoHeader } from './dto_header';
import { RecordCategory } from '../enum/record_category';
import { DtoQueryString, DtoBodyFormData } from './dto_variable';
import { DataMode } from '../enum/data_mode';
import { MockMode } from '../enum/mock_mode';

export interface DtoMock {

    id: string;

    collectionId: string;

    pid?: string;

    category: RecordCategory;

    mode: MockMode;

    name: string;

    url?: string;

    method?: string;

    queryStrings?: DtoQueryString[];

    formDatas?: DtoBodyFormData[];

    headers?: DtoHeader[];

    body?: string;

    dataMode?: DataMode;

    res?: string;

    sort?: number;

    description?: string;

    children?: DtoMock[];
}