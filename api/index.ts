import * as Koa from 'koa';
import Middleware from './middlewares/middleware';

let app = new Koa();

app.use(Middleware(app));

app.use(ctx => {
    ctx.body = "failed";
});

app.listen(81);