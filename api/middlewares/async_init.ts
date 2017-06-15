import { ConnectionManager } from "../services/connection_manager";
import { run } from '../run_engine/schedule';

export default function asyncInit(): (ctx: any, next: Function) => Promise<void> {
    let isAsyncInit = false;
    return async (ctx, next) => {
        if (!isAsyncInit) {
            isAsyncInit = true;
            await ConnectionManager.init();
            await run();
        }
        await next();
    };
}