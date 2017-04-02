import { SessionService } from "../services/session_service";

export default function sessionRolling(): (ctx: any, next: Function) => Promise<void> {
    return async (ctx, next) => {
        SessionService.rollDate(ctx);
        return await next();
    };
}