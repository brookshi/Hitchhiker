import { Record } from '../../models/record';
import { SwaggerImport } from '../importer/swagger_import';
import { ImportType } from '../../common/enum/string_type';
import { User } from '../../models/user';
import { PostmanImport } from '../importer/postman_import';

export interface RequestImport<T> {

    convert(target: T, collectionId: string): Record;
}

export interface RequestsImport {

    import(data: any, projectId: string, user: User): Promise<void>;
}

export class Importer {

    static async do(data: any, projectId: string, user: User): Promise<void> {
        const type = Importer.getType(data);
        await Importer.get(type).import(data, projectId, user);
    }

    static get(type: ImportType): RequestsImport {
        switch (type) {
            case 'swagger':
                return new SwaggerImport();
            case 'postman':
                return new PostmanImport();
            default:
                throw new Error(`not support this type: ${type}`);
        }
    }

    static getType(data: any): ImportType {
        if (data.swagger) {
            return 'swagger';
        } else {
            return 'postman';
        }
    }
}