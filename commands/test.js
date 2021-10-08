const {
    MessageActionRow,
    MessageButton,
    MessageEmbed
} = require('discord.js');

exports.run = async (client, interaction, settings, guildSettings, userSettings) => {

    interaction.reply(`***What I Know***\n\nGuild Settings: \`\`\`js\n${JSON.stringify(guildSettings, null, "\t")}\`\`\`\nUser Settings: \`\`\`js\n${JSON.stringify(userSettings, null, "\t")}\`\`\``)

}

exports.data = {
    name: "test", // name of command used on lists etc...
    usage: "use this to run the text command", // how to use the command
    overview: "Short description about it", // shown on main help page
    description: "Longer description about it", // description of what the command does
    field: "None", // for command with multiple field's EI: /subteam create having like "name", "description", "thumbnail" etc
    image: "", // gif / image to be shown (as a short guide / sneak peak into the command) I can make these
    thumbnail: "" // not sure if this would be used
}