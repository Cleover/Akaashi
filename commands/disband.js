const {
    MessageActionRow,
    MessageButton,
    MessageEmbed
} = require('discord.js');

exports.run = async (client, message, settings) => {
    let data = client.getSubteamByUser(message.user.id)

    data.then(function (result) {

        if (!result[0]) return message.reply("You do not have a subteam to Disband!")

        const row = new MessageActionRow()
            .addComponents(new MessageButton()
                .setCustomID(`STD|Y|${result[0].owner}|${result[0].name}|1`)
                .setLabel('YES')
                .setStyle('DANGER'));
        row.addComponents(new MessageButton()
            .setCustomID(`STD|N|${result[0].owner}|${result[0].name}`)
            .setLabel('NO')
            .setStyle('SUCCESS'));

        const embed = new MessageEmbed()
            .setTitle(`Subteam Disband`)
            .setColor("#ff0f0f")
            .setDescription(`<@${result[0].owner}>, would you like to disband your ${result[0].name} Subteam?`)

        message.reply({
            ephemeral: true,
            embeds: [embed],
            components: [row]
        });


    })
}

exports.data = {
    name: "disband", // name of command used on lists etc...
    usage: "this is how you use the command", // how to use the command
    overview: "Short description about it", // shown on main help page
    description: "Longer description about it", // description of what the command does
    field: "None", // for command with multiple field's EI: /subteam create having like "name", "description", "thumbnail" etc
    image: "", // gif / image to be shown (as a short guide / sneak peak into the command) I can make these
    thumbnail: "" // not sure if this would be used
}