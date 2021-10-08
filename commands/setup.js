const {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Permissions
} = require('discord.js');

require('../utils/safe.js')();

exports.run = async (client, interaction, settings, guildSettings, userSettings, lang) => {

    if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply("You do not have permission to run this command.")


    const setupSettings = {
        "accept_deny_channel": settings.filter(word => word.name == "accept-deny-channel")[0],
        "notify_channel": settings.filter(word => word.name == "notify-channel")[0],
        "subteam_category": settings.filter(word => word.name == "subteam-category")[0],
        "vote_requirements": settings.filter(word => word.name == "vote-requirements")[0].value,
        "emoji_server_id": getSafe(() => (settings.filter(word => word.name == "emoji-server-id")[0].value)),
    }

    if (setupSettings.accept_deny_channel.channel.type != "GUILD_TEXT") return interaction.reply(lang.accept_deny_channel_not_channel)
    if (setupSettings.notify_channel.channel.type != "GUILD_TEXT") return interaction.reply(lang.notify_channel_not_channel)

    if (setupSettings.subteam_category.channel.type != "GUILD_CATEGORY") return interaction.reply(lang.subteam_category_not_category)

    console.log(`${setupSettings.vote_requirements} < 0 = ${Number(setupSettings.vote_requirements) < 0}`)

    if (setupSettings.vote_requirements < 0 || setupSettings.vote_requirements >= 100) return interaction.reply(lang.vote_requirements_invalid)

    // Check if we can view the server & if we have admin perms 


}

exports.data = {
    name: "setup", // name of command used on lists etc...
    usage: "this is how you use the command", // how to use the command
    overview: "Short description about it", // shown on main help page
    description: "Longer description about it", // description of what the command does
    field: "None", // for command with multiple field's EI: /subteam create having like "name", "description", "thumbnail" etc
    image: "", // gif / image to be shown (as a short guide / sneak peak into the command) I can make these
    thumbnail: "" // not sure if this would be used
}