import { DtoHeader } from './dto_header';
import { RecordCategory } from '../common/record_category';
import { BodyType } from '../common/string_type';
import { DtoUser } from './dto_user';
import { ParameterType } from '../common/parameter_type';
import { DtoAssert } from './dto_assert';
import { DtoQueryString, DtoBodyFormData } from './dto_variable';
import { DataMode } from '../common/data_mode';

export interface DtoRecord {

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

    history?: DtoRecordHistory[];

    assertInfos?: _.Dictionary<DtoAssert[]>;

    body?: string;

    bodyType?: BodyType;

    dataMode?: DataMode;

    parameters?: string;

    parameterType: ParameterType;

    prescript?: string;

    test?: string;

    sort?: number;
}

export interface DtoRecordHistory {

    id: number;

    record: DtoRecord;

    user: DtoUser;

    createDate: Date;
}