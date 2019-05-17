const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const BitGoJS = require('bitgo');


const app = new Koa();
app.use(bodyParser());

const router = new Router();

router.get('/', (ctx, next) => {
    ctx.body = 'Hello'
})

router.post('/api/sends', async ctx => {
    console.log(ctx.request.body);
    const result = [];

    //ctx.body = 'Hello'
    const body = ctx.request.body;

    const coin = body.symbol;
    try{
        if(body.env === 'prod') {
            body.recipient.amount = String(Number(body.recipient.amount) * 1e18);
        }

        const bitgo = new BitGoJS.BitGo({ env: body.env, accessToken: body.accessToken });
        const basecoin = bitgo.coin(coin);
        const walletInstance = await basecoin.wallets().get({ id: body.walletId });

        await bitgo.lock({});
        await bitgo.unlock({ otp: body.otp })



        const transaction = await walletInstance.sendMany({
          recipients: [body.recipient],
          walletPassphrase: body.walletPassphrase
        });

        console.log('Wallet ID:', walletInstance.id());
        console.log('Current Receive Address:', body.recipient.address);
        console.log('New Transaction:', transaction.status);
      ctx.body = {
        address: body.recipient.address,
        amount: body.recipient.amount,
        status: transaction.status,
      };
    }catch(e){
        console.log('Error', e);
        if(e.result) {
          if(e.result.error){
            ctx.throw(401, e.result.error);
          }else{
            ctx.body = {
              address: body.recipient.address,
              amount: body.recipient.amount,
              status: e.result.status,
            };
          }
        }else{
            ctx.throw(401, e);
        }
    }
})

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async ctx => {
    ctx.body = ctx.request.body;
});



app.listen(3000);
