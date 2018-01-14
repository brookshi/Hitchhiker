import * as Koa from 'koa';
import Middleware from './middlewares/middleware';
import { Log } from './utils/log';
import { ChildProcessManager } from './run_engine/process/child_process_manager';
import 'reflect-metadata';
import { WebSocketService } from './services/web_socket_service';
import { Setting } from './utils/setting';
import { ProjectDataService } from './services/project_data_service';
import * as KoaRouter from 'koa-router';
import * as Bodyparser from 'koa-bodyparser';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as KoaStatic from 'koa-static';

let app = new Koa();
const router = new KoaRouter();

router.get('/setup/env', (ctx, next) => {
    ctx.body = getPm2Obj().apps[0].env;
});

router.post('/setup/env', (ctx, next) => {
    const pm2Obj = getPm2Obj();
    pm2Obj.apps[0].env = ctx.request.body;
    fs.writeFileSync(getPm2File(), JSON.stringify(pm2Obj), 'utf8');
    try {
        execSync('pm2 -V', { encoding: 'utf8' });
    } catch (e) {
        execSync(`npm install pm2 -g`);
    }
    const stdout = execSync(`pm2 start ${getPm2File()}`, { encoding: 'utf8' });
    ctx.body = stdout;
});

app.use(KoaStatic(path.join(__dirname, 'public'), { gzip: true }))
    .use(Bodyparser())
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(9527);

function getPm2File() {
    return path.join(__dirname, 'pm2.json');
}

function getPm2Obj() {
    const pm2Content = fs.readFileSync(getPm2File(), 'utf8');
    return JSON.parse(pm2Content);
}