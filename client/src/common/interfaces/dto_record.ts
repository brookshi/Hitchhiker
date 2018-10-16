import { DtoHeader } from './dto_header';
import { RecordCategory } from '../enum/record_category';
import { BodyType } from '../enum/string_type';
import { DtoUser } from './dto_user';
import { ParameterType, ReduceAlgorithmType } from '../enum/parameter_type';
import { DtoAssert } from './dto_assert';
import { DtoQueryString, DtoBodyFormData } from './dto_variable';
import { DataMode } from '../enum/data_mode';
import * as _ from 'lodash';

export interface DtoBaseItem {

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

    children?: DtoBaseItem[];
}

export interface DtoRecord extends DtoBaseItem {

    history?: DtoRecordHistory[];

    assertInfos?: _.Dictionary<DtoAssert[]>;

    bodyType?: BodyType;

    parameters?: string;

    reduceAlgorithm?: ReduceAlgorithmType;

    parameterType: ParameterType;

    prescript?: string;

    test?: string;
}

export interface DtoRecordHistory {

    id: number;

    record: DtoRecord;

    user: DtoUser;

    createDate: Date;
}