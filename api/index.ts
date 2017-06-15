import * as Koa from 'koa';
import * as http from 'http';
import Middleware from './middlewares/middleware';
import { Log } from "./utils/log";
import { ScheduleProcess } from "./run_engine/schedule_process";
import "reflect-metadata";

let app = new Koa();

Log.init();

ScheduleProcess.init();

app.use(Middleware(app));

http.createServer(function (req, resp) { });

app.listen(81); 