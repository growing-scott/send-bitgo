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

    const bitgo = new BitGoJS.BitGo({ env: body.env, accessToken: body.accessToken });
    const basecoin = bitgo.coin(coin);
    const walletInstance = await basecoin.wallets().get({ id: body.walletId });

    await bitgo.unlock({ otp: body.otp })
    try{
        const transaction = await walletInstance.sendMany({
          recipients: [body.recipient],
          walletPassphrase: body.walletPassphrase
        });

        console.log(transaction);

        console.log('Wallet ID:', walletInstance.id());
        console.log('Current Receive Address:', body.recipient.address);
        console.log('New Transaction:', transaction.status);
      ctx.body = {
        address: body.recipient.address,
        amount: body.recipient.amount,
        status: transaction.status,
      };
    }catch(e){
        console.log(e);
        if(e.result) {
          ctx.body = {
            address: body.recipient.address,
            amount: body.recipient.amount,
            status: e.result.status,
          };
        }else{
            ctx.body = {
              address: body.recipient.address,
              amount: body.recipient.amount,
              status: 'Unknown server error.',
            };
        }
    }
})

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async ctx => {
    console.log('---------', ctx.request.body)
    ctx.body = ctx.request.body;
});



app.listen(3000);
