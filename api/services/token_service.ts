import { RegToken } from "../common/reg_token";
import { Setting } from "../utils/setting";
import { InviteToTeamToken } from "../common/invite_team_token";
import { StringUtil } from "../utils/string_util";
import * as uuid from 'uuid';

export class TokenService {

    private static tokens: { [key: string]: number } = {};

    static isValidToken(token: string): boolean {
        return !!TokenService.tokens[token];
    }

    static buildRegToken(): string {
        const info: RegToken = { host: Setting.instance.app.host, date: new Date(), uid: uuid.v1() };
        const token = TokenService.buildToken(info);
        TokenService.tokens[token] = 1;

        return token;
    }

    static buildInviteToTeamToken(userId: string): string {
        const info: InviteToTeamToken = { userId: userId, date: new Date(), uid: uuid.v1() };
        const token = TokenService.buildToken(info);
        TokenService.tokens[token] = 1;

        return token;
    }

    private static buildToken(info: any): string {
        const text = JSON.stringify(info);
        return encodeURIComponent(StringUtil.encrypt(text));
    }
}