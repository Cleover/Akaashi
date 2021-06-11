const modules = "./modules/";

const fs = require("fs");
const Discord = require('discord.js');
require("dotenv").config()

const client = new Discord.Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES'],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

require('./utils/functions')(client);

client.mongoose = require('./utils/mongoose');

client.commands = new Discord.Collection();

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

fs.readdirSync(modules).forEach(file => {
  fs.readdir(`./modules/${file}/`, (err, files) => {
    if (err) return console.error(err);

    let jsFile = files.filter(f => f.split(".").pop() === "js");
    if (jsFile.length <= 0) {
      return console.log("Couldn't find any commands.");
    }
    jsFile.forEach(f => {
      let pull = require(`./modules/${file}/${f}`);
      client.commands.set(pull.data.name, pull);
    });
  });
});

client.mongoose.init();

client.login(process.env.TOKEN);