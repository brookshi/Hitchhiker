import { ConnectionManager } from '../services/connection_manager';

export default function asyncInit(): (ctx: any, next: Function) => Promise<void> {
    let isAsyncInit = false;
    return async (_ctx, next) => {
        if (!isAsyncInit) {
            isAsyncInit = true;
            await ConnectionManager.init();
        }
        await next();
    };
}