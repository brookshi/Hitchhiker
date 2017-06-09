import * as Koa from 'koa';
import * as http from 'http';
import Middleware from './middlewares/middleware';
import { Log } from "./utils/log";
import { BatchProcess } from "./run_engine/batch_process";

let app = new Koa();

Log.init();

BatchProcess.init();

app.use(Middleware(app));

http.createServer(function (req, resp) { });

app.listen(81); 