import { Connection } from 'typeorm';
import { User } from "../models/user";
import { ConnectionManager } from "./connectionManager";

export class UserService {

    static async getUser(userId: string): Promise<User> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(User)
            .createQueryBuilder("user")
            .innerJoinAndSelect('user.teams', 'team')
            .where(`user.id = :id`)
            .setParameter('id', userId)
            .getOne();
    }
}