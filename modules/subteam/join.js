const {
    MessageActionRow,
    MessageButton,
    MessageEmbed
} = require('discord.js');
const interaction = require('../../events/interaction');

exports.run = async (client, message, settings) => {

    let data = client.getSubteamByUser(settings[0].options[0].value)

    data.then(function (result) {

        if (!result) return message.reply("There is no subteam with this info, this shouldn't be able to happen and <@280885861984239617> probably messed something up!")

        let subteam = result[0]

        // Check if they are already in the subteam

        let howManySubteams = client.GetAllSubteamsByMember(message.user.id)

        howManySubteams.then(function (numberOfSubteams) {

            let joinLimit = 3

            if (message.member.roles.cache.get(process.env.TIER3)) joinLimit = 5
            else if (message.member.roles.cache.get(process.env.TIER2)) joinLimit = 4
            else if (message.member.roles.cache.get(process.env.TIER1)) joinLimit = 4

            if (numberOfSubteams >= joinLimit) return message.reply(`You are currently at the ${joinLimit} subteam limit! To join another you must leave a subteam your a part of.`)

            if (subteam.members.some(e => e.userID === message.user.id)) return message.reply("You are already a part of this subteam!")

            // Check if the subteam is at the member cap
            if (subteam.members.length == subteam.capacity) return message.reply("This subteam is at the member cap!")

            let attachedMessage = "none"

            if (settings[0].options[1]) attachedMessage = settings[0].options[1].value

            const row = new MessageActionRow()
                .addComponents(new MessageButton()
                    .setCustomID(`STJR|A|${subteam.name}|${subteam.owner}|${message.user.id}`)
                    .setLabel('Accept')
                    .setStyle('SUCCESS'));

            row.addComponents(new MessageButton()
                .setCustomID(`STJR|D|${subteam.name}|${subteam.owner}|${message.user.id}`)
                .setLabel('Deny')
                .setStyle('DANGER'));

            const embed = new MessageEmbed()
                .setTitle(`You got a subteam join Request from ${message.user.username}#${message.user.discriminator}!`)
                .setColor(subteam.color)
                .setDescription(`**User:** ${message.user}\n**Message:** \`\`\`${attachedMessage}\`\`\``)
                .setThumbnail(message.user.avatarURL({
                    format: 'png',
                    dynamic: true,
                    size: 1024
                }))

            client.channels.cache.get(result[0].channel).send(`<@${result[0].owner}>`, {
                embed,
                ephemeral: true,
                components: [row]
            });

            message.reply("Subteam Request Sent!")

        })



    })
}

exports.data = {
    name: "join", // name of command used on lists etc...
    usage: "this is how you use the command", // how to use the command
    overview: "Short description about it", // shown on main help page
    description: "Longer description about it", // description of what the command does
    field: "None", // for command with multiple field's EI: /subteam create having like "name", "description", "thumbnail" etc
    image: "", // gif / image to be shown (as a short guide / sneak peak into the command) I can make these
    thumbnail: "" // not sure if this would be used
}