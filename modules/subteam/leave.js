const {
    MessageActionRow,
    MessageButton,
    MessageEmbed
} = require('discord.js');

exports.run = async (client, message, settings) => {

    let data = client.getSubteamByUser(settings[0].options[0].value)

    data.then(function (result) {

        if (!result) return message.reply("There is no subteam with this info, this shouldn't be able to happen and <@280885861984239617> probably messed something up!")

        let subteam = result[0]

        if (!subteam.members.some(e => e.userID === message.user.id)) return message.reply("You are not a part of this subteam!")

        message.reply("You have left!")

        const leaveEmbed = new MessageEmbed()
            .setTitle(`Subteam Leave Notice`)
            .setColor("#f7cba6")
            .setDescription(`<@${message.user.id}>, has left the subteam.`)

        client.channels.cache.get(subteam.channel).send(leaveEmbed);

        // Add them to the subteam
        client.removeUserFromSubteam(settings[0].options[0].value, message.user.id)

        // Remove the role

        let roleToRemove = message.guild.roles.fetch(result[0].role)

        roleToRemove.then((roleData) => {

            let user = message.guild.members.fetch(message.user.id)
            user.then((userToRemoveRoleFrom) => {
                userToRemoveRoleFrom.roles.remove(roleData, `Added the role ${roleData.name} to ${userToRemoveRoleFrom.user.username}.`)
            })
        })

    })
}

exports.data = {
    name: "leave", // name of command used on lists etc...
    usage: "this is how you use the command", // how to use the command
    overview: "Short description about it", // shown on main help page
    description: "Longer description about it", // description of what the command does
    field: "None", // for command with multiple field's EI: /subteam create having like "name", "description", "thumbnail" etc
    image: "", // gif / image to be shown (as a short guide / sneak peak into the command) I can make these
    thumbnail: "" // not sure if this would be used
}