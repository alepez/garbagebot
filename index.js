const Bot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;
const bot = new Bot(token, { polling: true });

bot.on('message', (msg) => {
  const text = msg.text.toString();
  const chatId = msg.chat.id;
  bot.sendMessage(msg.chat.id, msg.text.toString().toUpperCase());
});
