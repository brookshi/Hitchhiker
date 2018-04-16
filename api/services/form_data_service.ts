import { ConnectionManager } from './connection_manager';
import { StringUtil } from '../utils/string_util';
import { DtoBodyFormData } from '../interfaces/dto_variable';
import { BodyFormData } from '../models/body_form_data';

export class FormDataService {
    static fromDto(dtoFormData: DtoBodyFormData): BodyFormData {
        let formData = new BodyFormData();
        formData.key = dtoFormData.key;
        formData.value = dtoFormData.value;
        formData.isActive = dtoFormData.isActive;
        formData.sort = dtoFormData.sort;
        formData.id = dtoFormData.id || StringUtil.generateUID();
        formData.description = dtoFormData.description;
        return formData;
    }

    static clone(formData: BodyFormData): BodyFormData {
        const target = <BodyFormData>Object.create(formData);
        target.id = undefined;
        return target;
    }

    static async deleteForRecord(recordId: string) {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(BodyFormData).createQueryBuilder('formData')
            .delete()
            .where('formData.record=:id', { id: recordId })
            .execute();
    }
}