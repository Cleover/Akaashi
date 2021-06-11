const {
    MessageEmbed
} = require('discord.js');


function Error(client, type, user, channel, message) {
    const embed = new MessageEmbed()
        .setTitle(`Subteam ${type} Error`)
        .setColor("#f7cba6")
        .setDescription(`<@${user}>, ${message}`)

    return client.channels.cache.get(channel).send(`<@${user}>`, embed);
}

function Accepted(user, channel, message) {
    const embed = new MessageEmbed()
        .setTitle(`Subteam Creation Accepted!`)
        .setColor("#f7cba6")
        .setDescription(`<@${user}>, ${message}`)

    return channel.send(`<@${user}>`, embed);
}

function Denied(client, user, channel, message) {
    const embed = new MessageEmbed()
        .setTitle(`Subteam Creation Denied!`)
        .setColor("#f7cba6")
        .setDescription(`<@${user}>, ${message}`)

    return client.channels.cache.get(channel).send(`<@${user}>`, embed);
}


function Edited(client, user, channel, message) {
    const embed = new MessageEmbed()
        .setTitle(`Subteam Edit Accepted!`)
        .setColor("#f7cba6")
        .setDescription(`<@${user}>, ${message}`)

    return client.channels.cache.get(channel).send(`<@${user}>`, embed);
}

function EditDenied(client, user, channel, message) {
    const embed = new MessageEmbed()
        .setTitle(`Subteam Edit Denied!`)
        .setColor("#f7cba6")
        .setDescription(`<@${user}>, ${message}`)

    return client.channels.cache.get(channel).send(`<@${user}>`, embed);
}

function JoinAccept(client, user, channel, message) {
    const embed = new MessageEmbed()
        .setTitle(`Subteam Edit Denied!`)
        .setColor("#f7cba6")
        .setDescription(`<@${user}>, ${message}`)

    return client.channels.cache.get(channel).send(`<@${user}>`, embed);
}

function JoinDeny(client, user, channel, message) {
    const embed = new MessageEmbed()
        .setTitle(`Subteam Join Rejected!`)
        .setColor("#f7cba6")
        .setDescription(`<@${user}>, ${message}`)

    return client.channels.cache.get(channel).send(`<@${user}>`, embed);
}

function JoinAccept(client, user, channel, message) {
    const embed = new MessageEmbed()
        .setTitle(`Subteam Join Accepted!`)
        .setColor("#f7cba6")
        .setDescription(`<@${user}>, ${message}`)

    return client.channels.cache.get(channel).send(`<@${user}>`, embed);
}

function JoinError(client, user, channel, message) {
    const embed = new MessageEmbed()
        .setTitle(`Subteam Join Error`)
        .setColor("#f7cba6")
        .setDescription(`<@${user}>, ${message}`)

    return client.channels.cache.get(channel).send(`<@${user}>`, embed);
}

module.exports = {
    Error,
    Accepted,
    Denied,
    Edited,
    EditDenied,
    JoinDeny,
    JoinAccept,
    JoinError,
}