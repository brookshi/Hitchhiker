import { DtoUser } from './dto_user';
import { DtoEnvironment } from './dto_environment';
import { LocalhostMapping } from '../models/localhost_mapping';

export interface DtoProject {

    id: string;

    name: string;

    note?: string;

    members?: DtoUser[];

    localhosts?: Partial<LocalhostMapping>[];

    environments?: DtoEnvironment[];

    isMe?: boolean;

    owner: Partial<DtoUser>;

    createDate?: Date;
}