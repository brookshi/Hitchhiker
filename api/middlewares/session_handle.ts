import { SessionService } from "../services/session_service";
import { Message } from "../common/message";
import { Setting } from "../utils/setting";

export default function sessionHandle(): (ctx: any, next: Function) => Promise<void> {
    return async (ctx, next) => {
        const isSessionValid = await SessionService.isSessionValid(ctx);
        if (!isSessionValid) {
            ctx.body = { success: false, message: Message.sessionInvalid };
            ctx.redirect(Setting.instance.app.host);
            return;
        }
        SessionService.rollDate(ctx);
        return await next();
    };
}