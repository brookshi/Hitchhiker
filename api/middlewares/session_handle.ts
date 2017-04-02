import { SessionService } from "../services/session_service";

export default function sessionHandle(): (ctx: any, next: Function) => Promise<void> {
    return async (ctx, next) => {
        if (!SessionService.isSessionValid(ctx)) {
            ctx.body = { success: false, message: 'session is invalid' };
            return;
        }
        SessionService.rollDate(ctx);
        return await next();
    };
}