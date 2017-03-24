import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Header {
    @PrimaryColumn()
    id: string;

    @Column()
    key: string;

    @Column()
    value: string;

    @Column()
    isActive: boolean;

    @Column()
    sort: number;

    @Column()
    recordId: string;
}