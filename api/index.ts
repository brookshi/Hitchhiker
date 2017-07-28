import * as Koa from 'koa';
import Middleware from './middlewares/middleware';
import { Log } from './utils/log';
import { ScheduleProcessManager } from './run_engine/schedule_process_manager';
import 'reflect-metadata';
import { WebSocketService } from './services/web_socket_service';
import { Setting } from './utils/setting';

let app = new Koa();

Log.init();

Setting.instance.init();

ScheduleProcessManager.instance.init();

app.use(Middleware(app));

const server = app.listen(81);

new WebSocketService(server).start();