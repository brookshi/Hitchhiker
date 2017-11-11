import * as Koa from 'koa';
import { DateUtil } from '../utils/date_util';
import { User } from '../models/user';
import { UserService } from './user_service';
import { UserVariableManager } from './user_variable_manager';
import { StringUtil } from '../utils/string_util';

export class SessionService {

    static get bypass(): string[] {
        return [
            'api/user/login$',
            'api/user$',
            'api/user/regconfirm$',
            'api/user/findpwd$',
            'api/project/join$',
            'api/project/reject$',
            '/$',
            '/api/sample(/.*)?',
            '/index.html$',
            'api/user/temp$'
        ];
    }

    static get maxAge() {
        return DateUtil.DAY * 7;
    }

    static login(ctx: Koa.Context, userId: string) {
        (<any>ctx).sessionHandler.regenerateId();
        (<any>ctx).session.userId = userId;
        (<any>ctx).session.date = new Date();
    }

    static logout(ctx: Koa.Context) {
        const userId = (<any>ctx).session.userId;
        if ((<any>ctx).session && (<any>ctx).session.userId) {
            UserVariableManager.clearVariables((<any>ctx).session.userId);
            UserVariableManager.clearCookies((<any>ctx).session.userId);
        }
        (<any>ctx).session = null;
    }

    static async isSessionValid(ctx: Koa.Context): Promise<boolean> {
        const userId = (<any>ctx).session.userId;
        let validUser = !!userId;
        if (validUser) {
            const checkRst = await UserService.checkUserById(userId);
            validUser = checkRst.success;
            if (validUser) {
                (<any>ctx).session.user = checkRst.result;
                (<any>ctx).session.userId = userId;
            }
        }
        if (ctx.headers.authorization) {
            const match = StringUtil.checkAutho(ctx.headers.authorization);
            if (match) {
                const info = Buffer.from(match[1], 'base64').toString();
                const [user, pwd] = info.split(':');
                const checkRst = await UserService.checkUser(user, pwd);
                validUser = checkRst.success;
            }
        }
        return validUser || !!SessionService.bypass.find(o => new RegExp(o, 'g').test(ctx.request.url.replace(`?${ctx.request.querystring}`, '')));
    }

    static rollDate(ctx: Koa.Context) {
        const date = SessionService.getDate(ctx);
        if (!date) {
            return;
        }
        if (DateUtil.diff(date, new Date()) > 24) {
            SessionService.updateDate(ctx);
        }
    }

    static updateDate(ctx: Koa.Context) {
        (<any>ctx).session.date = new Date();
    }

    static getDate(ctx: Koa.Context): Date {
        return <Date>(<any>ctx).session.date;
    }

    static getUserId(ctx: Koa.Context): string {
        return (<any>ctx).session.userId;
    }

    static getUser(ctx: Koa.Context): User {
        return (<any>ctx).session.user;
    }
}