import { Header } from "../models/header";
import { DtoHeader } from "../interfaces/dto_header";

export class HeaderService {
    static fromDto(dtoHeader: DtoHeader): Header {
        let header = new Header();
        header.key = dtoHeader.key;
        header.value = dtoHeader.value;
        header.isActive = dtoHeader.isActive;
        header.sort = dtoHeader.sort;
        return header;
    }

    static clone(header: Header): Header {
        const target = <Header>Object.create(header);
        target.id = undefined;
        return target;
    }
}