import { Header } from '../models/header';
import { DtoHeader } from '../interfaces/dto_header';
import { ConnectionManager } from './connection_manager';
import { StringUtil } from '../utils/string_util';

export class HeaderService {
    static fromDto(dtoHeader: DtoHeader): Header {
        let header = new Header();
        header.key = dtoHeader.key;
        header.value = dtoHeader.value;
        header.isActive = dtoHeader.isActive;
        header.sort = dtoHeader.sort;
        header.id = dtoHeader.id || StringUtil.generateUID();
        return header;
    }

    static clone(header: Header): Header {
        const target = <Header>Object.create(header);
        target.id = undefined;
        return target;
    }

    static async  deleteForRecord(recordId: string) {
        const connection = await ConnectionManager.getInstance();
        await connection.getRepository(Header).createQueryBuilder('header')
            .delete()
            .where('header.record=:id', { id: recordId })
            .execute();
    }
}