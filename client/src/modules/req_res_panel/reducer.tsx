import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { DtoResRecord } from '../../../../api/interfaces/dto_res';
import { ActiveTabType } from './action';
import { getDefaultRecord } from "../../state";

export default function reqResPanel(state: {} = {}, action: any): DtoRecord | DtoResRecord {
    switch (action.type) {
        case ActiveTabType:
            return action.activeRecord;
        default:
            return getDefaultRecord();
    }
}