const fs = require("fs");
const Discord = require('discord.js');

const client = new Discord.Client({
  intents: ['GUILDS'],
});

require('./utils/functions')(client);

require("dotenv").config()

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

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(f => {
    let commandName = f.split(".")[0];
    let pull = require(`./commands/${commandName}`);
    client.commands.set(pull.data.name, pull);
  });
});


client.mongoose.init();

client.login(process.env.TOKEN);