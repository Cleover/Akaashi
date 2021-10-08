const {
  MessageActionRow,
  MessageButton,
  MessageEmbed
} = require('discord.js');

//const request = require('request');

require('../utils/urls.js')();
require('../utils/safe.js')();

exports.run = async (client, interaction, settings, lang) => {

  if (await client.getSubteamByUser(interaction.user.id)) return interaction.reply("You already own a subteam!")

  let tier1 = interaction.member.roles.cache.get(process.env.TIER1)
  let tier2 = interaction.member.roles.cache.get(process.env.TIER2)
  let tier3 = interaction.member.roles.cache.get(process.env.TIER3)

  if (!(tier2 || tier3)) return interaction.reply("You need either Tier 2 or Tier 3 on patron to create a subteam, consider subscribing at https://www.patreon.com/dwain")

  let joinLimit = 3

  if (tier3) joinLimit = 5
  else if (tier2) joinLimit = 4
  else if (tier1) joinLimit = 4

  if (await client.GetAllSubteamsByMember(interaction.user.id) >= joinLimit) return interaction.reply(`You are currently at the ${joinLimit} subteam limit! To create a subteam you must leave some!`)

  const subteam = {
    owner: interaction.user.id,
    name: settings.filter(word => word.name == "subteam-name")[0].value,
    channel: (settings.filter(word => word.name == "channel-name")[0].value).replace(/\s+/g, '-'),
    role: getSafe(() => (settings.filter(word => word.name == "role-name")[0].value), settings.filter(word => word.name == "subteam-name")[0].value),
    color: getSafe(() => (settings.filter(word => word.name == "role-color")[0].value), "#95a5a6"),
    overview: settings.filter(word => word.name == "short-description")[0].value,
    description: settings.filter(word => word.name == "description")[0].value,
    banner: getSafe(() => (settings.filter(word => word.name == "banner")[0].value)),
    thumbnail: getSafe(() => (settings.filter(word => word.name == "thumbnail")[0].value)),
    emoji: getSafe(() => (settings.filter(word => word.name == "emoji")[0].value)),
  }

  // Check the role
  if (subteam.role.length > 20) return interaction.reply(lang.role_name_too_long)
  if (!/^[A-Za-z0-9 ]+$/g.test(subteam.role)) return interaction.reply(lang.role_name_unallowed_characters)

  // Check the channel
  if (subteam.channel.length > 20) return interaction.reply(lang.channel_name_too_long)
  if (!/^([A-Za-z0-9-\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]])+$/g.test(subteam.channel)) return interaction.reply(lang.channel_name_unallowed_characters)

  // Check the rest
  if (subteam.name.length > 40) return interaction.reply(lang.subteam_name_too_long)
  if (subteam.overview.length > 256) return interaction.reply(lang.subteam_overview_too_long)
  if (subteam.description.length > 1000) return interaction.reply(lang.subteam_description_too_long)

  // Make sure color is a valad hex code
  if (subteam.color)
    if (!/^#[A-Fa-f0-9]{5}/g.test(subteam.color)) return interaction.reply(lang.role_hex_mismatch)

  const row = new MessageActionRow()
    .addComponents(new MessageButton()
      .setCustomId('STR|A|3')
      .setLabel('Accept')
      .setStyle('SUCCESS'));

  row.addComponents(new MessageButton()
    .setCustomId('STR|D|3')
    .setLabel('Deny')
    .setStyle('DANGER'));

  const embed = new MessageEmbed()
    .setTitle(`A user is requesting to make a new subteam! Accept/Deny? (${process.env.REQUIRE} Vote(s) Required)`)
    .setColor(subteam.color)
    .setDescription(`Accepted:\nDenied:`)
    .addField("Name", `${subteam.name}`, false)
    .addField("Overview", `${subteam.overview}`, false)
    .addField("Description", `${subteam.description}`, false)
    .addField("Owner", `<@${subteam.owner}>`, true)
    .addField("Role", `${subteam.role}`, true)
    .addField("Channel", `${subteam.channel}`, true)
    .setFooter(`Application Sent By | ${subteam.owner}`)

  if (subteam.banner)
    if (checkURL(subteam.banner)) embed.setImage(subteam.banner)
  else return interaction.reply(lang.subteam_banner_image_incorrect)

  if (subteam.thumbnail)
    if (checkURL(subteam.thumbnail)) embed.setThumbnail(subteam.thumbnail)
  else return interaction.reply(lang.subteam_thumbnail_image_incorrect)

  if (subteam.emoji) {
    if (checkURL(subteam.emoji)) embed.addField("Emoji", `${subteam.emoji}`, true)
    else return interaction.reply(userLand.subteam_emoji_image_incorrect)

    let size = await getSize(subteam.emoji)
    if (size >= 256) return interaction.reply(`${lang.subteam_emoji_image_too_large} ${size}kb`)
  }

  client.channels.cache.get(process.env.STAFF).send({
    embeds: [embed],
    components: [row]
  });

  // ephemeral: true 

  interaction.reply(lang.subteam_creation)
  // client.createSubteam(subteam)

}

exports.data = {
  name: "create", // name of command used on lists etc...
  usage: "this is how you use the command", // how to use the command
  overview: "Short description about it", // shown on main help page
  description: "Longer description about it", // description of what the command does
  field: "None", // for command with multiple field's EI: /subteam create having like "name", "description", "thumbnail" etc
  image: "", // gif / image to be shown (as a short guide / sneak peak into the command) I can make these
  thumbnail: "" // not sure if this would be used
}