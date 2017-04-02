import * as Koa from 'koa';
import * as Compose from 'koa-compose';
import * as Bodyparser from 'koa-bodyparser';
import * as Session from 'koa-session-minimal';
import { WebApiRouter } from 'webapi-router';
import sessionRolling from './session_rolling';
import { SessionService } from "../services/session_service";
import routeFailed from "./route_failed";

export default function middleware(context: Koa) {
    let ctrlRouter = new WebApiRouter();
    return Compose(
        [
            Session({
                cookie: {
                    maxAge: SessionService.maxAge
                }
            }),
            sessionRolling(),
            Bodyparser(),
            ctrlRouter.router('../bin/controllers', 'api'),
            routeFailed(),
        ]
    );
}