import * as Koa from 'koa';
import * as Compose from 'koa-compose';
import * as Bodyparser from 'koa-bodyparser';
import * as Session from 'koa-session-minimal';
import { WebApiRouter } from 'webapi-router';
import sessionRolling from './session_rolling';

export default function middleware(context: Koa) {
    let ctrlRouter = new WebApiRouter();
    return Compose(
        [
            Session(),
            sessionRolling(),
            Bodyparser(),
            ctrlRouter.router('../bin/controllers', 'api'),
        ]
    );
}