const {
    MessageActionRow,
    MessageButton,
    MessageEmbed
} = require('discord.js');

exports.run = async (client, message, settings) => {

    const row = new MessageActionRow()
        .addComponents(new MessageButton()
            .setCustomId(`STL|1|L|${message.user.id}`)
            .setEmoji("⬅️")
            .setStyle('PRIMARY'));

    row.addComponents(new MessageButton()
        .setCustomId(`STL|1|R|${message.user.id}`)
        .setEmoji("➡️")
        .setStyle('PRIMARY'));


    const embed = new MessageEmbed()
        .setColor('#f7cba6')
        .setTitle('List of all active subteams')
        .setDescription('To view more info on a subteam do `/subteam info (Subteam)`')
        .setFooter(`Page Number 1`)

    let all = client.GetAllSubteams()

    all.then(function (result) {

        const newList = [...result];

        newList.splice(5, result.length);

        newList.forEach(subteam => {
            embed.addField(`Subteam: ${subteam.name}`, `Overview: ${subteam.overview}`, false)
        });

        let messageObj = {
            embeds: [embed],
        }

        if (result.length > 5) messageObj.components = [row]

        message.reply(messageObj);
    })
}

exports.data = {
    name: "list", // name of command used on lists etc...
    usage: "this is how you use the command", // how to use the command
    overview: "Short description about it", // shown on main help page
    description: "Longer description about it", // description of what the command does
    field: "None", // for command with multiple field's EI: /subteam create having like "name", "description", "thumbnail" etc
    image: "", // gif / image to be shown (as a short guide / sneak peak into the command) I can make these
    thumbnail: "" // not sure if this would be used
}