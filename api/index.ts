import * as Koa from 'koa';
import * as http from 'http';
import Middleware from './middlewares/middleware';

let app = new Koa();

app.use(Middleware(app));

app.use(ctx => {
    ctx.body = "failed";
});

http.createServer(function (req, resp) { });
app.listen(81);