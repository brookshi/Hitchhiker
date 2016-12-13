'use strict'

import * as Koa from 'koa';
import * as Compose from 'koa-compose';
import * as Bodyparser from 'koa-bodyparser';
import * as Session from 'koa-session-minimal';
import {ControllerRouter} from './controller-router/index';

export default function middleware(context: Koa){
    let ctrlRouter = new ControllerRouter();
    return Compose(
        [
            Session(),
            Bodyparser(),
            ctrlRouter.router(),
        ]
    );
}