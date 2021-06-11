const Discord = require('discord.js');

exports.run = async (client, message, settings) => {

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    if (!settings[0].options) {

        let commandEmbed = new Discord.MessageEmbed()
            .setColor("#f7cba6")
            .setTitle("Subteam Commands List")
            .setDescription(`Use \`/help (command)\` for more info on a command`)
            .setTimestamp()
            .setFooter(`© ${client.user.username}`, client.user.avatarURL({
                format: 'png',
                dynamic: true,
                size: 1024
            }))

        client.commands.forEach(val => {
            if (!val.data.hidden) commandEmbed.addField(capitalizeFirstLetter(val.data.name), val.data.overview, true)
        });

        message.reply(commandEmbed)

    } else {
        client.commands.forEach(val => {
            if (val.data.name == settings[0].options[0].value) {
                let embed = new Discord.MessageEmbed()
                    .setColor("#f7cba6")
                    .setTitle("Command Help For : " + val.data.name)
                    .setDescription(val.data.description)
                    .addField("Usage", "```" + val.data.usage + "```", false)
                    .addField("Fields", "```" + val.data.field + "```", false)
                    .setTimestamp()
                    .setFooter(`© ${client.user.username}`, client.user.avatarURL({
                        format: 'png',
                        dynamic: true,
                        size: 1024
                    }))

                    if(val.data.image) embed.setImage(val.data.image)
                    if(val.data.thumbnail) embed.setThumbnail(val.data.thumbnail)

                message.reply(embed);
            }
        });
    }
}

exports.data = {
    name: "help", // name of command used on lists etc...
    usage: "this is how you use the command", // how to use the command
    overview: "Short description about it", // shown on main help page
    description: "Longer description about it", // description of what the command does
    field: "None", // for command with multiple field's EI: /subteam create having like "name", "description", "thumbnail" etc
    image: "", // gif / image to be shown (as a short guide / sneak peak into the command) I can make these
    thumbnail: "" // not sure if this would be used
}