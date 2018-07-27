import { DtoHeader } from './dto_header';
import { RecordCategory } from '../enum/record_category';
import { BodyType } from '../enum/string_type';
import { DtoUser } from './dto_user';
import { ParameterType, ReduceAlgorithmType } from '../enum/parameter_type';
import { DtoAssert } from './dto_assert';
import { DtoQueryString, DtoBodyFormData } from './dto_variable';
import { DataMode } from '../enum/data_mode';
import * as _ from 'lodash';

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

    reduceAlgorithm?: ReduceAlgorithmType;

    parameterType: ParameterType;

    prescript?: string;

    test?: string;

    sort?: number;

    description?: string;

    children?: DtoRecord[];
}

export interface DtoRecordHistory {

    id: number;

    record: DtoRecord;

    user: DtoUser;

    createDate: Date;
}