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

    static removeToken(token: string) {
        Reflect.deleteProperty(TokenService.tokens, token);
    }

    static buildRegToken(): string {
        const info: RegToken = { host: Setting.instance.app.host, date: new Date(), uid: uuid.v1() };
        const token = TokenService.buildToken(info);
        TokenService.tokens[token] = 1;

        return token;
    }

    static buildInviteToTeamToken(userEmail: string, teamId: string, inviterId: string, inviterEmail: string): string {
        const info: InviteToTeamToken = { userEmail, inviterId, inviterEmail, teamId, date: new Date(), uid: uuid.v1() };
        const token = TokenService.buildToken(info);
        TokenService.tokens[token] = 1;

        return token;
    }

    static parseToken<T extends RegToken | InviteToTeamToken>(token: string): T {
        const json = StringUtil.decrypt(token);
        const info = <T>JSON.parse(json);
        info.date = new Date(info.date);
        return info;
    }

    private static buildToken(info: any): string {
        const text = JSON.stringify(info);
        return encodeURIComponent(StringUtil.encrypt(text));
    }
}