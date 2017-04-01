export default function sessionRolling(): (ctx: any, next: Function) => Promise<void> {
    const hour = 3600 * 1000;

    return async (ctx, next) => {
        const date = ctx.session.date;
        if (!date) {
            return await next();
        }
        const timeDiff = Math.abs(new Date().getTime() - date.getTime());
        const diffHours = Math.ceil(timeDiff / hour);
        if (diffHours > 24) {
            ctx.session.date = Date.now();
        }
        return await next();
    };
}