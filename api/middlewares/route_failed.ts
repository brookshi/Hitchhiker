import { Message } from '../common/message';

export default function routeFailed(): (ctx: any, next: Function) => Promise<void> {
    return async (ctx, next) => {
        ctx.body = { success: false, message: Message.apiNotExist };
        return await next();
    };
}