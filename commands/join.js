const { MessageActionRow, MessageSelectMenu } = require('discord.js');

exports.run = async (client, interaction, settings) => {

    let data = client.GetAllSubteams()
    let arr = []

    data.then(function (result) {

        if (result) {
            if(result.length == 0) return interaction.reply({ content: 'No subteam to join' })

            result.forEach(element => {
                if (arr.length != 25) {
                    
                    arr.push({label: element.name, description: `${element.overview.substring(0, 97)}...`, value:element.owner, emoji: element.emoji})
                }
            });
        }else return interaction.reply({ content: 'No subteam to join' })
        
        const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('select')
                .setPlaceholder('Nothing selected')
                .addOptions(arr),
        );

    interaction.reply({ content: 'Choose a subteam to join!', components: [row], 
    // ephemeral: true 
});

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