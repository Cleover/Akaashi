const Discord = require('discord.js');

exports.run = async (client, message, settings) => {

    let data = client.getSubteamByUser(settings[0].options[0].value)

    data.then(function (result) {

        arr = []

        result[0].members.forEach(member => {
            arr.push(`<@${member.userID}>`)
        });

        let subteamInfo = new Discord.MessageEmbed()
            .setColor(result[0].color)
            .setTitle(result[0].name)
            .setDescription(result[0].description)
            .addField("Owner", `<@${result[0].owner}>`, false)
            .addField("Role", `<@&${result[0].role}>`, true)
            .addField("Channel", `<#${result[0].channel}>`, true)
            .addField("Users", `${result[0].members.length}/${result[0].capacity}`, true)
            .addField("Level", `${Math.floor(result[0].xp / 1500)}`, true)
            .addField("XP", `${Math.floor(result[0].xp)}/${(Math.floor(result[0].xp / 1500) + 1 )* 1500} `, true)
            .addField("Member List", arr.join(" "), false)

        if (result[0].banner) subteamInfo.setImage(result[0].banner)
        if (result[0].thumbnail) subteamInfo.setThumbnail(result[0].thumbnail)

        message.reply(subteamInfo)

    })

}

exports.data = {
    name: "info", // name of command used on lists etc...
    usage: "this is how you use the command", // how to use the command
    overview: "Short description about it", // shown on main help page
    description: "Longer description about it", // description of what the command does
    field: "None", // for command with multiple field's EI: /subteam create having like "name", "description", "thumbnail" etc
    image: "", // gif / image to be shown (as a short guide / sneak peak into the command) I can make these
    thumbnail: "" // not sure if this would be used
}