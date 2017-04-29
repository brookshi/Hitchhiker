import { DtoResRecord } from '../../../../api/interfaces/dto_res';
import { DtoRecord } from '../../../../api/interfaces/dto_record';

export const ActiveTabType = 'active_tab_type';

export const activeTabAction = (activeRecord: DtoResRecord | DtoRecord) => {
    return {
        type: ActiveTabType,
        activeRecord: activeRecord
    }
}