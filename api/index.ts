import * as Koa from 'koa';
import * as http from 'http';
import Middleware from './middlewares/middleware';
import { Log } from "./utils/log";
import { ScheduleProcess } from "./run_engine/schedule_process";
import * as WS from 'ws';
import "reflect-metadata";
import { WebSocketService } from "./services/web_socket_service";

let app = new Koa();

Log.init();

ScheduleProcess.init();

app.use(Middleware(app));

const server = app.listen(81);

new WebSocketService(server).start();