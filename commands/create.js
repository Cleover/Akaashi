const {
  MessageActionRow,
  MessageButton,
  MessageEmbed
} = require('discord.js');

exports.run = async (client, message, settings) => {

  let usersSubteam = client.getSubteamByUser(message.user.id)

  usersSubteam.then(function (userData) {

    if (userData) return message.reply("You already own a subteam!")

    let tier1 = message.member.roles.cache.get(process.env.TIER1)
    let tier2 = message.member.roles.cache.get(process.env.TIER2)
    let tier3 = message.member.roles.cache.get(process.env.TIER3)

    if (!(tier2 || tier3)) return message.reply("You need either Tier 2 or Tier 3 on patron to create a subteam, consider subscribing at https://www.patreon.com/dwain")

    let howManySubteams = client.GetAllSubteamsByMember(message.user.id)

    howManySubteams.then(function (numberOfSubteams) {

      let joinLimit = 3

      if (tier3) joinLimit = 5
      else if (tier2) joinLimit = 4
      else if (tier1) joinLimit = 4

      if (numberOfSubteams >= joinLimit) return message.reply(`You are currently at the ${joinLimit} subteam limit! To create a subteam you must leave some!`)

      function getSafe(fn, defaultVal) {
        try {
          return fn();
        } catch (e) {
          return defaultVal;
        }
      }

      function checkURL(url) {
        return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
      }

      const subteam = {
        owner: message.user.id,
        name: settings[0].options.filter(word => word.name == "subteam-name")[0].value,
        channel: (settings[0].options.filter(word => word.name == "channel-name")[0].value).replace(/\s+/g, '-'),
        role: getSafe(() => (settings[0].options.filter(word => word.name == "role-name")[0].value), settings[0].options.filter(word => word.name == "subteam-name")[0].value),
        color: getSafe(() => (settings[0].options.filter(word => word.name == "role-color")[0].value), "#95a5a6"),
        overview: settings[0].options.filter(word => word.name == "short-description")[0].value,
        description: settings[0].options.filter(word => word.name == "description")[0].value,
        banner: getSafe(() => (settings[0].options.filter(word => word.name == "banner")[0].value)),
        thumbnail: getSafe(() => (settings[0].options.filter(word => word.name == "thumbnail")[0].value)),
      }

      // Check the role
      if (subteam.role.length > 20) return message.reply("Sorry your role name is too long, it must be under 20 characters.")
      if (!/^[A-Za-z0-9 ]+$/g.test(subteam.role)) return message.reply("You role name can only contain (A-Z), (a-z), (0-9), and emojis.")

      // Check the channel
      if (subteam.channel.length > 20) return message.reply("Sorry your channel name is too long, it must be under 20 characters.")
      if (!/^([A-Za-z0-9-\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]])+$/g.test(subteam.channel)) return message.reply("You channel name can only contain (A-Z), (a-z), (0-9), (-), and emojis.")

      // Check the rest
      if (subteam.name.length > 40) return message.reply("Sorry your subteam name is too long, it must be under 40 characters.")
      if (subteam.overview.length > 256) return message.reply("Sorry your subteam overview is too long, it must be under 256 characters.")
      if (subteam.description.length > 1000) return message.reply("Sorry your subteam description is too long, it must be under 1000 characters.")

      // Make sure color is a valad hex code
      if (subteam.color)
        if (!/^#[A-Fa-f0-9]{5}/g.test(subteam.color)) return message.reply("Your color does not match the requirements of being a hex code")

      const row = new MessageActionRow()
        .addComponents(new MessageButton()
          .setCustomID('STR|A|3')
          .setLabel('Accept')
          .setStyle('SUCCESS'));

      row.addComponents(new MessageButton()
        .setCustomID('STR|D|3')
        .setLabel('Deny')
        .setStyle('DANGER'));

      const embed = new MessageEmbed()
        .setTitle(`A user is requesting to make a new subteam! Accept/Deny? (3 Votes Required)`)
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
      else return message.reply("Your banner image is incorrect, please make sure it is either a image or a gif")

      if (subteam.thumbnail)
        if (checkURL(subteam.thumbnail)) embed.setThumbnail(subteam.thumbnail)
      else return message.reply("Your thumbnail image is incorrect, please make sure it is either a image or a gif")


      // console.log(embed)

      client.channels.cache.get(process.env.STAFF).send(`<@&${process.env.PING}>`, {
        embed,
        components: [row]
      });
      message.reply("This process will change in the future.\nCreating Subteam...")
      // client.createSubteam(subteam)
    })


  })
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