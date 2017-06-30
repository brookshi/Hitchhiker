import { Log } from '../utils/log';

export default function errorHandle(): (ctx: any, next: Function) => Promise<void> {
    return async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            Log.error(err);
            ctx.status = err.status || 500;
            ctx.body = err.message;
            ctx.app.emit('error', err, ctx);
        }
    };
}