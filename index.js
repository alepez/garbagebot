const Bot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const token = process.env.TELEGRAM_TOKEN;
const dbDir = process.env.GARBAGEBOT_DB_DIR;
const bot = new Bot(token, { polling: true });

const Subscriber = function (msg) {
  const { chat } = msg;
  const filename = path.join(dbDir, String(chat.id));

  // TODO Calendar should be choosen by user
  this.data = {
    chat,
    calendar: 'italy/trebaseleghe/zone-b'
  };

  const calendar = require(path.join(__dirname, './lib/cal/', this.data.calendar + '.js'));

  const send = (msg) => {
    bot.sendMessage(chat.id, msg);
  };

  this.request = ({ cmd }) => {
    if (cmd === 'tomorrow') {
      const tomorrow = new Date((24 * 3600 * 1000) + (new Date().getTime()));
      const todo = calendar.getByDate(tomorrow);
      send(todo.join());
    }
  };

  this.save = () => {
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
    records[filename] = new Subscriber(JSON.parse(readFile(filename)));
  });
  return records;
};

const subscribers = readAllFiles();

bot.on('message', async (msg) => {
  const { text, chat } = msg;

  let sub = subscribers[chat.id];

  if (text === '/start') {
    if (sub) {
      bot.sendMessage(chat.id, "Already registered");
      return;
    }

    sub = new Subscriber(msg);
    subscribers[chat.id] = sub;
    await sub.save();
    return;
  }

  if (text === '/tomorrow' || text === '/tom') {
    sub.request({ cmd: 'tomorrow' })
    return;
  }
});
