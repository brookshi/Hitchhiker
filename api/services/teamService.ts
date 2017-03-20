import { Connection } from 'typeorm';
import { Team } from "../models/team";
import { ConnectionManager } from "./connectionManager";

export class TeamService {
    static async getTeam(id: string): Promise<Team> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(Team)
            .createQueryBuilder('team')
            .innerJoinAndSelect('team.collections', 'collection')
            .where('id=:id')
            .setParameter('id', id)
            .getOne();
    }

    static async getTeams(ids: string[]): Promise<Team[]> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(Team)
            .createQueryBuilder('team')
            .innerJoinAndSelect('team.collections', 'collection')
            .where('1=1')
            .andWhereInIds(ids)
            .getMany();
    }
}