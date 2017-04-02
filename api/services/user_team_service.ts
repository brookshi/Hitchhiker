import { DtoTeamQuit } from "../interfaces/dto_team_quit";
import { UserService } from "./user_service";
import { ResObject } from "../common/res_object";
import { Message } from "../common/message";

export class UserTeamService {

    static async quitTeam(info: DtoTeamQuit): Promise<ResObject> {
        let user = await UserService.getUserById(info.userId, true, true);
        const teamIndex = user.teams.findIndex(v => v.id === info.teamId);
        if (teamIndex > -1) {
            user.teams.splice(teamIndex, 1);
        }
        await user.save();
        return { success: true, message: Message.teamQuitSuccess };
    }
}