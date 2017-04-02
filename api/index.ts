import * as Koa from 'koa';
import * as http from 'http';
import Middleware from './middlewares/middleware';

let app = new Koa();

app.use(Middleware(app));

http.createServer(function (req, resp) { });

app.listen(81);