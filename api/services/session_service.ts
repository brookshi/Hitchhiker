import * as Koa from 'koa';
import { DateUtil } from "../utils/date_util";
import { User } from "../models/user";

export class SessionService {

    static get bypass(): string[] {
        return [
            'api/user/login',
            'api/user',
            'api/user/regconfirm',
            'api/user/findpwd'
        ];
    }

    static get maxAge() {
        return DateUtil.DAY * 2;
    }

    static login(ctx: Koa.Context, userId: string) {
        (<any>ctx).sessionHandler.regenerateId();
        (<any>ctx).session.userId = userId;
        (<any>ctx).session.date = new Date();
    }

    static logout(ctx: Koa.Context) {
        (<any>ctx).session = null;
    }

    static async isSessionValid(ctx: Koa.Context): Promise<boolean> {
        return true;

        // const userId = (<any>ctx).session.userId;
        // let validUser = !!userId;
        // if (validUser) {
        //     const checkRst = await UserService.checkUserById(userId);
        //     validUser = checkRst.success;
        //     if (validUser) {
        //         (<any>ctx).session.user = checkRst.result;
        //     }
        // }
        // return validUser || !!SessionService.bypass.find(o => ctx.request.url.replace(`?${ctx.request.querystring}`, '').endsWith(o));
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
        (<any>ctx).session.date = Date.now();
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