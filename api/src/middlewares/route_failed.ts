import { Message } from '../utils/message';

export default function routeFailed(): (ctx: any, next: Function) => Promise<void> {
    return async (ctx, next) => {
        ctx.body = { success: false, message: Message.get('apiNotExist') };
        return await next();
    };
}