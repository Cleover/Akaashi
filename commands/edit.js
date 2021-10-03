const {
    MessageActionRow,
    MessageButton,
    MessageEmbed
} = require('discord.js');

exports.run = async (client, message, settings) => {

    let usersSubteam = client.getSubteamByUser(message.user.id)

    function checkURL(url) {
        return ((url.match(/\.(jpeg|jpg|gif|png)$/) != null) && (url.match(/imgur.com/g) != null));
    }

    usersSubteam.then(function (userData) {

        let failed = false

        if (!userData) return message.reply("You do not own a subteam!")

        if (!settings) return message.reply("You must provide values to edit!")

        const row = new MessageActionRow()
            .addComponents(new MessageButton()
                .setCustomId('STE|A|3')
                .setLabel('Accept')
                .setStyle('SUCCESS'));

        row.addComponents(new MessageButton()
            .setCustomId('STE|D|3')
            .setLabel('Deny')
            .setStyle('DANGER'));


        // List of changes
        const embed = new MessageEmbed()
            .setTitle(`A user is requesting to make a change to a existing subteam! Accept/Deny? (3 Votes Required)`)
            .setDescription(`Accepted:\nDenied:`)
            .addField("Owner", `<@${message.user.id}>`, true)
            .setFooter(`Application Sent By | ${message.user.id}`)

        settings.forEach(element => {

            switch (element.name) {
                case "subteam-name":

                    if (element.value.length > 40) {
                        message.reply("Sorry your subteam name is too long, it must be under 40 characters.")
                        failed = true
                    } else embed.addField("Name (OLD / NEW)", `${userData[0].name} / ${element.value}`, true)

                    break;
                case "channel-name":

                    let channel = element.value.replace(/\s+/g, '-')

                    if (element.value.length > 20) {
                        message.reply("Sorry your channel name is too long, it must be under 20 characters.")
                        failed = true
                    } else if (!/^([A-Za-z0-9-\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]])+$/g.test(channel)) {
                        message.reply("You channel name can only contain (A-Z), (a-z), (0-9), (-), and emojis.")
                        failed = true
                    } else embed.addField("Channel", `<#${userData[0].channel}> / ${channel}`, true)

                    break;
                case "role-name":

                    // Check the role
                    if (element.value.length > 20) {
                        message.reply("Sorry your role name is too long, it must be under 20 characters.")
                        failed = true
                    } else if (!/^[A-Za-z0-9 ]+$/g.test(element.value)) {
                        message.reply("You role name can only contain (A-Z), (a-z), (0-9), and emojis.")
                        failed = true
                    } else embed.addField("Role", `<@&${userData[0].role}> / ${element.value}`, true)

                    break;
                case "role-color":

                    if (!/^#[A-Fa-f0-9]{5}/g.test(element.value)) {
                        message.reply("Your color does not match the requirements of being a hex code")
                        failed = true
                    } else embed.setColor(element.value)

                    break;
                case "short-description":

                    if (element.value.length > 256) {
                        message.reply("Sorry your subteam overview is too long, it must be under 256 characters.")
                        failed = true
                    } else embed.addField("Overview", `${userData[0].overview} / ${element.value}`, true)

                    break;
                case "description":

                    if (element.value.length > 1000) {
                        message.reply("Sorry your subteam description is too long, it must be under 1000 characters.")
                        failed = true
                    } else embed.addField("Description", `${userData[0].description} / ${element.value}`, true)

                    break;
                case "banner":

                    if (checkURL(element.value)) embed.setImage(element.value)
                    else {
                        message.reply("Your banner image is incorrect, please make sure it is either a image or a gif and is a link from imgur")
                        failed = true
                    }

                    break;
                case "thumbnail":
                    if (checkURL(element.value)) embed.setThumbnail(element.value)
                    else {
                        message.reply("Your thumbnail image is incorrect, please make sure it is either a image or a gif and is a link from imgur")
                        failed = true
                    }
                    break;

                case "emoji":

                    if (checkURL(element.value)) embed.addField("Emoji", `${userData[0].emoji} / ${element.value}`, true)
                    else {
                        message.reply("Your thumbnail image is incorrect, please make sure it is either a image or a gif and is a link from imgur")
                        failed = true
                    }
                    
                    break;
                default:
                    console.log("Cleo you messed something up")
                    break;
            }

        });

        if (failed) return

        client.channels.cache.get(process.env.STAFF).send({
            // content: `<@&${process.env.PING}>`, 
            embeds: [embed],
            components: [row]
        });

        // ephemeral: true 
        message.reply("This process will change in the future.\nSending Edit Request")

    })
}

exports.data = {
    name: "edit", // name of command used on lists etc...
    usage: "this is how you use the command", // how to use the command
    overview: "Short description about it", // shown on main help page
    description: "Longer description about it", // description of what the command does
    field: "None", // for command with multiple field's EI: /subteam create having like "name", "description", "thumbnail" etc
    image: "", // gif / image to be shown (as a short guide / sneak peak into the command) I can make these
    thumbnail: "" // not sure if this would be used
}