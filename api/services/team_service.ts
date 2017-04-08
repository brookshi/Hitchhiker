import { Team } from "../models/team";
import { ConnectionManager } from "./connection_manager";
import { DtoTeam } from "../interfaces/dto_team";
import { ResObject } from "../common/res_object";
import { Message } from "../common/message";

export class TeamService {

    static async getTeam(id: string, needCollection: boolean = true, needUser: boolean = false): Promise<Team> {
        const connection = await ConnectionManager.getInstance();

        let rep = connection.getRepository(Team).createQueryBuilder('team');
        if (needCollection) {
            rep = rep.leftJoinAndSelect('team.collections', 'collection');
        }
        if (needUser) {
            rep = rep.leftJoinAndSelect('team.users', 'user');
        }

        return await rep.where('id=:id')
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
            rep = rep.leftJoinAndSelect('team.users', 'user');
        }

        return await rep.where('1=1')
            .andWhereInIds(ids)
            .getMany();
    }

    static async saveTeam(dtoTeam: DtoTeam): Promise<ResObject> {
        const team = Team.fromDto(dtoTeam);
        await team.save();
        return { success: true, message: Message.teamSaveSuccess };
    }
}