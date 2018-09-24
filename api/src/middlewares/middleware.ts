import * as Compose from 'koa-compose';
import * as Bodyparser from 'koa-bodyparser';
import * as Session from 'koa-session-minimal';
import { WebApiRouter } from 'webapi-router';
import sessionHandle from './session_handle';
import { SessionService } from '../services/session_service';
import routeFailed from './route_failed';
import errorHandle from './error_handle';
import * as KoaStatic from 'koa-static';
import * as Path from 'path';
import asyncInit from './async_init';
import * as Compress from 'koa-compress';

export default function middleware() {
    const ctrlRouter = new WebApiRouter();
    return Compose(
        [
            asyncInit(),
            errorHandle(),
            KoaStatic(Path.join(__dirname, '../public'), { gzip: true, maxage: 60 * 60 * 24 * 30 * 12 }),
            Session({
                cookie: {
                    maxAge: SessionService.maxAge
                }
            }),
            sessionHandle(),
            Compress(),
            Bodyparser({ jsonLimit: '50mb' }),
            ctrlRouter.router('../build/controllers', 'api'),
            routeFailed(),
        ]
    );
}