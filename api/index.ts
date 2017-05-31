import * as Koa from 'koa';
import * as http from 'http';
import Middleware from './middlewares/middleware';
import { Log } from "./utils/log";

let app = new Koa();

Log.init();

app.use(Middleware(app));

http.createServer(function (req, resp) { });

app.listen(81); 