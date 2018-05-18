const Bot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const token = process.env.TELEGRAM_TOKEN;
const dbDir = process.env.GARBAGEBOT_DB_DIR;
const bot = new Bot(token, { polling: true });

const subscribers = [];

const Subscriber = function (msg) {
  console.log(msg);
  const { chat } = msg;
  const filename = path.join(dbDir, String(chat.id));

  this.data = {
    chat
  };

  this.save = () => {
    console.log(filename);
    return new Promise((resolve, reject) => {
      fs.writeFile(filename, JSON.stringify(this.data, null, 2), (err) => {
        if (err) return reject();
        return resolve();
      });
    });
  };
};

bot.on('message', async (msg) => {
  const { text, chat } = msg;

  console.log(JSON.stringify(msg));

  if (text === '/start') {
    const sub = new Subscriber(msg);
    subscribers[chat.id] = sub;
    await sub.save();
  }
});
