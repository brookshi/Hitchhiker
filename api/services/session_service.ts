import * as Koa from 'koa';
import { User } from "../models/user";
import { DateUtil } from "../utils/date_util";

export class SessionService {

    static get maxAge() {
        return DateUtil.DAY * 2;
    }

    static login(ctx: Koa.Context, user: User) {
        (<any>ctx).sessionHandler.regenerateId();
        (<any>ctx).session.user = user;
        (<any>ctx).session.date = new Date();
    }

    static logout(ctx: Koa.Context) {
        (<any>ctx).session = null;
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
}