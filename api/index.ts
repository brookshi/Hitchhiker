import * as Koa from 'koa';
import * as http from 'http';
import Middleware from './middlewares/middleware';
import { Log } from "./utils/log";
import { ScheduleProcess } from "./run_engine/schedule_process";
import * as WS from 'ws';
import "reflect-metadata";

let app = new Koa();

Log.init();

ScheduleProcess.init();

app.use(Middleware(app));

const server = app.listen(81);

const wss = new WS.Server({ server });

wss.on('connection', (ws, req) => {
    console.log('connection');
    ws.send('server data');
    ws.on('message', data => console.log(data));
});