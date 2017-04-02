import * as Koa from 'koa';
import { DateUtil } from "../utils/date_util";

export class SessionService {

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
}