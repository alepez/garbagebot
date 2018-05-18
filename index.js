const Bot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const token = process.env.TELEGRAM_TOKEN;
const dbDir = process.env.GARBAGEBOT_DB_DIR;
const bot = new Bot(token, { polling: true });

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

const listAllFiles = () => {
  return fs.readdirSync(dbDir);
};

const readFile = (filename) => {
  return fs.readFileSync(path.join(dbDir, filename), 'utf8');
}

const readAllFiles = () => {
  const files = listAllFiles();
  const records = {};
  files.forEach(filename => {
    records[filename] = JSON.parse(readFile(filename));
  });
  return records;
};

const subscribers = readAllFiles();
console.log(subscribers);

bot.on('message', async (msg) => {
  const { text, chat } = msg;

  console.log(JSON.stringify(msg));

  if (text === '/start') {
    if (subscribers[chat.id]) {
      bot.sendMessage(chat.id, "Already registered");
      return;
    }

    const sub = new Subscriber(msg);
    subscribers[chat.id] = sub;
    await sub.save();
  }
});
