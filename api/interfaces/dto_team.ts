import { DtoUser } from "./dto_user";
import { DtoEnvironment } from "./dto_environment";

export interface DtoTeam {

    id: string;

    name: string;

    note?: string;

    members?: DtoUser[];

    environments?: DtoEnvironment[];

    owner: Partial<DtoUser>;

    createDate?: Date;
}