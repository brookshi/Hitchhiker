import { Team } from "../models/team";
import { ConnectionManager } from "./connection_manager";
import { DtoTeam } from "../interfaces/dto_team";
import { ResObject } from "../common/res_object";
import { Message } from "../common/message";
import { StringUtil } from "../utils/string_util";
import { User } from "../models/user";

export class TeamService {

    static create(id: string) {
        const team = new Team();
        team.id = id;
        return team;
    }

    static fromDto(dtoTeam: DtoTeam, ownerId: string): Team {
        let team = TeamService.create(dtoTeam.id || StringUtil.generateUID());
        team.name = dtoTeam.name;
        team.note = dtoTeam.note;

        const owner = new User();
        owner.id = ownerId;
        team.owner = owner;

        return team;
    }

    static async getTeam(id: string, needCollection: boolean = true, needUser: boolean = false): Promise<Team> {
        const connection = await ConnectionManager.getInstance();

        let rep = connection.getRepository(Team).createQueryBuilder('team');
        if (needCollection) {
            rep = rep.leftJoinAndSelect('team.collections', 'collection');
        }
        if (needUser) {
            rep = rep.leftJoinAndSelect('team.members', 'members');
        }

        return await rep.where('team.id=:id')
            .setParameter('id', id)
            .getOne();
    }

    static async getTeams(ids: string[], needCollection: boolean = true, needUser: boolean = false): Promise<Team[]> {
        const connection = await ConnectionManager.getInstance();

        let rep = connection.getRepository(Team).createQueryBuilder('team');
        if (needCollection) {
            rep = rep.leftJoinAndSelect('team.collections', 'collection');
        }
        if (needUser) {
            rep = rep.leftJoinAndSelect('team.members', 'members');
        }

        return await rep.where('1=1')
            .andWhereInIds(ids)
            .getMany();
    }

    static async createTeam(dtoTeam: DtoTeam, ownerId: string): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();
        const team = TeamService.fromDto(dtoTeam, ownerId);

        await connection.getRepository(Team).persist(team);

        return { success: true, message: Message.teamSaveSuccess };
    }

    static async updateTeam(dtoTeam: DtoTeam): Promise<ResObject> {
        const connection = await ConnectionManager.getInstance();

        await connection.getRepository(Team)
            .createQueryBuilder('team')
            .where("id=:id", { id: dtoTeam.id })
            .update({ name: dtoTeam.name, note: dtoTeam.note })
            .execute();

        return { success: true, message: Message.teamSaveSuccess };
    }
}