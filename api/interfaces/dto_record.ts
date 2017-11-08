import { DtoHeader } from './dto_header';
import { RecordCategory } from '../common/record_category';
import { BodyType } from '../common/string_type';
import { DtoUser } from './dto_user';
import { ParameterType } from '../common/parameter_type';

export interface DtoRecord {

    id: string;

    collectionId: string;

    pid?: string;

    category: RecordCategory;

    name: string;

    url?: string;

    method?: string;

    headers?: DtoHeader[];

    history?: DtoRecordHistory[];

    body?: string;

    bodyType?: BodyType;

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