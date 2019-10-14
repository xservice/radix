import Monitor, { Context } from '@fvaa/monitor';
import Router from '../src/index';
type a = {
  a: boolean
}
const createServer = Monitor<Context & a>({ event: 'hashchange' });
const app = new Router<Context & a>({
  ignoreTrailingSlash: true,
  async defaultRoute(ctx) {
    console.log('404', ctx);
  }
});
app.get('/test/:id', async (ctx) => {
  ctx.body = ctx.params.id;
});
app.router('/test/:id', async (ctx) => {
  console.log('in router', await ctx.get<string>('/test/' + ctx.params.id));
});

createServer(async (ctx) => await app.lookup(ctx)).listen();