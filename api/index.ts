import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import Middleware from './middlewares/middleware'

let app = new Koa();

app.use(Middleware(app));

app.use(ctx=>
{
    ctx.body = "hello1111"
});

app.listen(81);