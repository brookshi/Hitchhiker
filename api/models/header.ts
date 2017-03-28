import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from "./user";
import { Record } from "./record";
import { DtoHeader } from "../interfaces/dto_header";

@Entity()
export class Header {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    value: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'int' })
    sort: number;

    @ManyToOne(type => User, user => user.id)
    record: Record;

    static fromDto(dtoHeader: DtoHeader): Header {
        let header = new Header();
        header.key = dtoHeader.key;
        header.value = dtoHeader.value;
        header.isActive = dtoHeader.isActive;
        header.sort = dtoHeader.sort;
        return header;
    }
}