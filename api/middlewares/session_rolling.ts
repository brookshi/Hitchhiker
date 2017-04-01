import { DateUtil } from "../utils/date_util";

export default function sessionRolling(): (ctx: any, next: Function) => Promise<void> {
    return async (ctx, next) => {
        const date = ctx.session.date;
        if (!date) {
            return await next();
        }
        if (DateUtil.diff(date, new Date()) > 24) {
            ctx.session.date = Date.now();
        }
        return await next();
    };
}