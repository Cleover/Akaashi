const {
    MessageActionRow,
    MessageButton,
    MessageEmbed
} = require('discord.js');

exports.run = async (client, message, settings) => {

    let userID = settings[0].options[0].user.id

    if (userID == message.user.id) return message.reply("You can't kick yourself, silly! You can kick a rock on the sidewalk though.", {
        ephemeral: true,
    })

    let data = client.getSubteamByUser(message.user.id)

    data.then(function (result) {

        if (!result) return message.reply("You can only kick members who are in a subteam you own.", {
            ephemeral: true,
        })

        console.log(result[0].members.some(e => e.userID === message.user.id))

        if (!(result[0].members.some(e => e.userID === userID))) return message.reply("You can only kick members who are in a subteam you own.", {
            ephemeral: true,
        })

        const row = new MessageActionRow()
            .addComponents(new MessageButton()
                .setCustomId(`STK|A|${userID}|${result[0].role}`)
                .setLabel('YES')
                .setStyle('DANGER'));

        row.addComponents(new MessageButton()
            .setCustomId(`STK|D|${userID}|${result[0].role}`)
            .setLabel('NO')
            .setStyle('SUCCESS'));

        const kickEmbed = new MessageEmbed()
            .setTitle(`Subteam Kick Check`)
            .setColor("#f7cba6")
            .setDescription(`<@${message.user.id}>, are you sure you want to kick <@${userID}>?`)

        message.reply({
            ephemeral: true,
            embeds: [kickEmbed],
            components: [row]
        })

    })
}

exports.data = {
    name: "kick", // name of command used on lists etc...
    usage: "this is how you use the command", // how to use the command
    overview: "Short description about it", // shown on main help page
    description: "Longer description about it", // description of what the command does
    field: "None", // for command with multiple field's EI: /subteam create having like "name", "description", "thumbnail" etc
    image: "", // gif / image to be shown (as a short guide / sneak peak into the command) I can make these
    thumbnail: "" // not sure if this would be used
}