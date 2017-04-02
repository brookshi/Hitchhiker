import { SessionService } from "../services/session_service";
import { Message } from "../common/message";

export default function sessionHandle(): (ctx: any, next: Function) => Promise<void> {
    return async (ctx, next) => {
        if (!SessionService.isSessionValid(ctx)) {
            ctx.body = { success: false, message: Message.sessionInvalid };
            return;
        }
        SessionService.rollDate(ctx);
        return await next();
    };
}