
export default function routeFailed(): (ctx: any, next: Function) => Promise<void> {
    return async (ctx, next) => {
        ctx.body = { success: false, message: 'this api does not exist' };
        return await next();
    };
}