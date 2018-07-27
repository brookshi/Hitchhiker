import { DtoUser } from './dto_user';
import { DtoEnvironment } from './dto_environment';

export interface LocalhostMapping {

    id: string;

    userId: string;

    ip: string;
}

export interface DtoProject {

    id: string;

    name: string;

    note?: string;

    members?: DtoUser[];

    localhosts?: Partial<LocalhostMapping>[];

    environments?: DtoEnvironment[];

    globalFunction?: string;

    isMe?: boolean;

    owner: Partial<DtoUser>;

    createDate?: Date;
}