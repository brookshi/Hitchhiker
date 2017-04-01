import * as Koa from 'koa';
import * as Compose from 'koa-compose';
import * as Bodyparser from 'koa-bodyparser';
import * as Session from 'koa-session-minimal';
import { WebApiRouter } from 'webapi-router';
import sessionRolling from './session_rolling';
import { DateUtil } from "../utils/date_util";

export default function middleware(context: Koa) {
    let ctrlRouter = new WebApiRouter();
    return Compose(
        [
            Session({
                cookie: {
                    maxAge: DateUtil.DAY * 2
                }
            }),
            sessionRolling(),
            Bodyparser(),
            ctrlRouter.router('../bin/controllers', 'api'),
        ]
    );
}