const {
    MessageActionRow,
    MessageButton,
    MessageEmbed
} = require('discord.js');

const {
    Error,
    Accepted,
    Denied,
    Edited,
    EditDenied,
    JoinDeny,
    JoinAccept,
    JoinError,
} = require('../handlers/embed');


module.exports = async (client, interaction) => {

    function cleanArray(actual) {
        var newArray = new Array();
        for (var i = 0; i < actual.length; i++) {
            if (actual[i]) {
                newArray.push(actual[i]);
            }
        }
        return newArray;
    }

    // Check if its a command 
    if (interaction.isCommand()) {

        const cmd = client.commands.get(`${interaction.options[0].name}`)
        if (!cmd) return;
        cmd.run(client, interaction, interaction.options);
    }

    // Check if its a button
    if (interaction.isMessageComponent() && interaction.componentType == 'BUTTON') {

        // Get the buttons id
        let buttonID = interaction.customID.split("|")

        // Arrays of accept / denys
        let accepted = []
        let denied = []

        // Original embed description
        let descriptionWithIds;
        if (buttonID[0] != "STD" && buttonID[0] != "STL" && buttonID[0] != "STK") descriptionWithIds = cleanArray(interaction.message.embeds[0].description.replace(/[^0-9\s-<@>]/g, '').split("\n"))

        // Set the accepted / deny arrays if we have them
        if (buttonID[0] != "STD" && buttonID[0] != "STL" && buttonID[0] != "STK")
            if (descriptionWithIds[0]) accepted = descriptionWithIds[0].trim().split(" ")
        if (buttonID[0] != "STD" && buttonID[0] != "STL" && buttonID[0] != "STK")
            if (descriptionWithIds[1]) denied = descriptionWithIds[1].trim().split(" ")

        // Disable row for Subteam Create / Subteam Edit

        const dissabledRow = new MessageActionRow()
            .addComponents(new MessageButton()
                .setCustomID('STR|A|3')
                .setLabel('Accept')
                .setStyle('SUCCESS')
                .setDisabled(true));

        dissabledRow.addComponents(new MessageButton()
            .setCustomID('STR|D|3')
            .setLabel('Deny')
            .setStyle('DANGER')
            .setDisabled(true));

        // Make a copy of the embed to edit down the line
        let editedEmbed = interaction.message.embeds[0]

        // Get the user id of the owner
        let createdBy;
        if (buttonID[0] != "STD" && buttonID[0] != "STL" && buttonID[0] != "STK")
            if (editedEmbed.footer) createdBy = editedEmbed.footer.text.split(" | ")[1]

        // Clean the array of any empty values
        let cleanAccepted;
        let cleanDenied;

        let page;

        // Save the users data for later
        let userPromise;
        if (buttonID[0] != "STD" && buttonID[0] != "STL" && buttonID[0] != "STK") userPromise = interaction.guild.members.fetch(createdBy)

        switch (buttonID[0]) {
            case "STR":

                if (!interaction.member.roles.cache.has(process.env.PING)) return

                // Check if they have already voted
                if (accepted.includes(`<@${interaction.user.id}>`)) {
                    // They have accepted before
                    if (buttonID[1] == "D") {
                        // Change their vote to deny
                        const index = accepted.indexOf(`<@${interaction.user.id}>`);
                        if (index > -1) {
                            accepted.splice(index, 1);
                            //Function to add it to deny
                            denied.push(`${interaction.user}`)
                        }
                    }

                } else if (denied.includes(`<@${interaction.user.id}>`)) {
                    // They have denied before
                    if (buttonID[1] == "A") {
                        // Change their vote to accept
                        const index = denied.indexOf(`<@${interaction.user.id}>`);
                        if (index > -1) {
                            denied.splice(index, 1);
                            //Function to add it to accept
                            accepted.push(`${interaction.user}`)
                        }
                    }
                } else {
                    // They have not voted yet, just do as they ask
                    if (buttonID[1] == "A") accepted.push(`${interaction.user}`)
                    else if (buttonID[1] == "D") denied.push(`${interaction.user}`)
                }

                // Clean the array of any empty values
                cleanAccepted = cleanArray(accepted)
                cleanDenied = cleanArray(denied)


                // Extract the data from the user promise
                userPromise.then((user) => {

                    // If more then 3 people have voted for accept
                    if (cleanAccepted.length >= 3) {

                        // Edit the embed with the new description
                        editedEmbed.description = `Accepted: ${cleanAccepted.join(" ")}\nDenied: ${cleanDenied.join(" ")}\n\n**Final Consensus: Accepted!**`

                        // Update the embed with the new description saying it was Accepted
                        interaction.update({
                            embeds: [editedEmbed],
                            components: [dissabledRow]
                        });

                        // Check that the user is still applicable to have a Subteam 
                        let howManySubteams = client.GetAllSubteamsByMember(createdBy)

                        // With that data =>
                        howManySubteams.then(function (numberOfSubteams) {

                            // Check if the user has tier 2 and tier 3, and save them for use later
                            let tier1 = user.roles.cache.get(process.env.TIER1)
                            let tier2 = user.roles.cache.get(process.env.TIER2)
                            let tier3 = user.roles.cache.get(process.env.TIER3)

                            // Default join limit of 3
                            let joinLimit = 3

                            // Check if they have either of the roles, if they do change the join limit
                            if (tier3) joinLimit = 5
                            else if (tier2) joinLimit = 4
                            else if (tier1) joinLimit = 4

                            // If they have reached the join limit tell the creator that it was accepted but they have reached the limit
                            if (numberOfSubteams >= joinLimit) return Error(client, "Creation", createdBy, process.env.JOIN, "Your request to make a subteam was accepted. However, since you have hit the subteam join limit. Please leave a subteam and re-submit your request. You can also subscribe to our [Patreon](https://www.patreon.com/dwain) to increase your join limit.")

                            if (!(tier2 || tier3)) return Error(client, "Creation", createdBy, process.env.JOIN, "Your request to create a subteam was accepted. However, you are no longer a Patron of Tier 2 or Tier 3. Please consider resubscribing and resubmit a request to make a subteam.")

                            let usersSubteam = client.getSubteamByUser(createdBy)

                            usersSubteam.then(function (userData) {

                                if (userData) return Error(client, "Creation", createdBy, process.env.JOIN, "ERROR HERE")

                                // Create the subteam
                                interaction.guild.roles.create({
                                    name: editedEmbed.fields.filter(word => word.name == "Role")[0].value,
                                    color: (editedEmbed.color).toString(16),
                                    reason: `Created a role for the subteam ${editedEmbed.fields.filter(word => word.name == "Name")[0].value}`,
                                }).then(role => {

                                    // Create the channel
                                    interaction.guild.channels.create(editedEmbed.fields.filter(word => word.name == "Channel")[0].value, {
                                        type: "text",
                                        permissionOverwrites: [{
                                            id: interaction.guild.roles.everyone,
                                            deny: ['VIEW_CHANNEL'] //Deny permissions
                                        }, {
                                            id: role.id,
                                            allow: ['VIEW_CHANNEL'], //Allow permissions
                                        }],
                                        reason: `Created a channel for the subteam ${editedEmbed.fields.filter(word => word.name == "Name")[0].value} & assigned it the role and permissions based around the ${role.name} role.`,
                                    }).then(channel => {
                                        channel.setParent(process.env.SUBTEAM, {
                                            lockPermissions: false
                                        })

                                        // Add the role to the user
                                        user.roles.add(role, `Added the role ${role.name} to ${client.users.cache.get(createdBy).username}.`)

                                        // Send the embed in the newly created channel
                                        Accepted(createdBy, channel, `your request to make your Subteam was accepted! Welcome to your new subteam home, your subteam now shows up on the \`/subteam join/info/list\` pages, you will be notifed in here when a user requests to join.`)

                                        const subteam = {
                                            owner: createdBy,
                                            name: editedEmbed.fields.filter(word => word.name == "Name")[0].value,
                                            channel: channel.id,
                                            role: role.id,
                                            color: (editedEmbed.color).toString(16),
                                            overview: editedEmbed.fields.filter(word => word.name == "Overview")[0].value,
                                            description: editedEmbed.fields.filter(word => word.name == "Description")[0].value,

                                            xp: 0,
                                            capacity: 50,

                                            members: [{
                                                userID: createdBy
                                            }],
                                        }

                                        if (editedEmbed.image) subteam.banner = editedEmbed.image.url
                                        if (editedEmbed.thumbnail) subteam.thumbnail = editedEmbed.thumbnail.url

                                        client.createSubteam(subteam)

                                    })
                                })
                            })
                        })
                    } else if (cleanDenied.length >= 3) {

                        // Edit the embed with the new description
                        editedEmbed.description = `Accepted: ${cleanAccepted.join(" ")}\nDenied: ${cleanDenied.join(" ")}\n\n**Final Consensus: Denied!**`
                        // Update the embed with the new description saying it was Denied
                        interaction.update({
                            embeds: [editedEmbed],
                            components: [dissabledRow]
                        });

                        // Tell the creator that it was denied

                        Denied(client, createdBy, process.env.JOIN, "your request to make your Subteam was denied. For more information, please reach out to our <@696451853478789221> bot. Our <@&474034125582499840> team can provide an explanation to the denial and help you create your Subteam.")
                    } else {

                        editedEmbed.description = `Accepted: ${cleanAccepted.join(" ")}\nDenied: ${cleanDenied.join(" ")}`
                        interaction.update({
                            embeds: [editedEmbed]
                        });
                    }
                })

                break;
            case "STE":
                if (!interaction.member.roles.cache.has(process.env.PING)) return

                // Check if they have already voted
                if (accepted.includes(`<@${interaction.user.id}>`)) {
                    // They have accepted before
                    if (buttonID[1] == "D") {
                        // Change their vote to deny
                        const index = accepted.indexOf(`<@${interaction.user.id}>`);
                        if (index > -1) {
                            accepted.splice(index, 1);
                            //Function to add it to deny
                            denied.push(`${interaction.user}`)
                        }
                    }

                } else if (denied.includes(`<@${interaction.user.id}>`)) {
                    // They have denied before
                    if (buttonID[1] == "A") {
                        // Change their vote to accept
                        const index = denied.indexOf(`<@${interaction.user.id}>`);
                        if (index > -1) {
                            denied.splice(index, 1);
                            //Function to add it to accept
                            accepted.push(`${interaction.user}`)
                        }
                    }
                } else {
                    // They have not voted yet, just do as they ask
                    if (buttonID[1] == "A") accepted.push(`${interaction.user}`)
                    else if (buttonID[1] == "D") denied.push(`${interaction.user}`)
                }

                // Clean the array of any empty values
                cleanAccepted = cleanArray(accepted)
                cleanDenied = cleanArray(denied)

                let usersSubteam = client.getSubteamByUser(createdBy)

                usersSubteam.then(function (subteam) {

                    // Extract the data from the user promise

                    userPromise.then((user) => {

                        // If more then 3 people have voted for accept
                        if (cleanAccepted.length >= 3) {

                            // Edit the embed with the new description
                            editedEmbed.description = `Accepted: ${cleanAccepted.join(" ")}\nDenied: ${cleanDenied.join(" ")}\n\n**Final Consensus: Accepted!**`

                            // Update the embed with the new description saying it was Accepted
                            interaction.update({
                                embeds: [editedEmbed],
                                components: [dissabledRow]
                            });


                            if (!subteam) return

                            // Get the embed info 

                            editedEmbed.fields.forEach(field => {

                                let newValue = field.value.split(" / ")

                                switch (field.name) {
                                    case "Name (OLD / NEW)":

                                        // Just edit database with the value "Android / New Name"

                                        client.editSubteam(subteam[0].owner, "name", newValue[1])

                                        break;
                                    case "Channel":

                                        // Just edit channel name

                                        let channelToUpdate = interaction.guild.channels.cache.get(subteam[0].channel)

                                        channelToUpdate.edit({
                                                name: newValue[1]
                                            }, `Edited subteam channel name`)
                                            .catch(console.error);

                                        break;
                                    case "Role":

                                        // Just edit role name

                                        let roleToUpdate = interaction.guild.roles.cache.get(subteam[0].role)

                                        roleToUpdate.edit({
                                                name: newValue[1]
                                            }, `Edited subteam role name`)
                                            .catch(console.error);

                                        break;
                                    case "Overview":

                                        // Just edit overview in database

                                        client.editSubteam(subteam[0].owner, "overview", newValue[1])

                                        break;
                                    case "Description":

                                        // Just edit description in database

                                        client.editSubteam(subteam[0].owner, "description", newValue[1])

                                        break;
                                }

                            });

                            if (editedEmbed.thumbnail) client.editSubteam(subteam[0].owner, "thumbnail", editedEmbed.thumbnail.url)

                            if (editedEmbed.image) client.editSubteam(subteam[0].owner, "banner", editedEmbed.image.url)

                            // if color edit channel / role

                            if (editedEmbed.color) {
                                let roleToUpdate = interaction.guild.roles.cache.get(subteam[0].role)

                                roleToUpdate.edit({
                                        color: editedEmbed.color.toString(16)
                                    }, `Edited subteam role color`)
                                    .catch(console.error);
                                client.editSubteam(subteam[0].owner, "color", editedEmbed.color.toString(16))
                            }

                            Edited(client, createdBy, subteam[0].channel, "your request to edit your subteam was accepted! All changes have been applied and if there are any issues, feel free to contact our <@696451853478789221> bot and our <@&474034125582499840> team can provide you assistance.")


                        } else if (cleanDenied.length >= 3) {

                            if (!subteam) return

                            // Edit the embed with the new description
                            editedEmbed.description = `Accepted: ${cleanAccepted.join(" ")}\nDenied: ${cleanDenied.join(" ")}\n\n**Final Consensus: Denied!**`
                            // Update the embed with the new description saying it was Denied
                            interaction.update({
                                embeds: [editedEmbed],
                                components: [dissabledRow]
                            });

                            // Tell the creator that it was denied
                            EditDenied(client, createdBy, subteam[0].channel, "your request to edit your subteam was denied. For more information, please reach out to our <@696451853478789221> bot and our <@&474034125582499840> team can provide an explanation to the denial and help you create your Subteam.")

                        } else {

                            editedEmbed.description = `Accepted: ${cleanAccepted.join(" ")}\nDenied: ${cleanDenied.join(" ")}`
                            interaction.update({
                                embeds: [editedEmbed]
                            });
                        }
                    })

                })

                break;
            case "STD":

                if (interaction.user.id != buttonID[2]) return

                // Subteam Disband

                if (buttonID[1] == "Y") {

                    // They choose Yes

                    if (buttonID[4] == 1) {
                        // This is the first "yes"

                        // Send embed and check #2

                        const disbandRow = new MessageActionRow()
                            .addComponents(new MessageButton()
                                .setCustomID(`STD|Y|${buttonID[2]}|${buttonID[3]}|2`)
                                .setLabel('Confirm Disband')
                                .setStyle('DANGER'));
                        disbandRow.addComponents(new MessageButton()
                            .setCustomID(`STD|N|${buttonID[2]}|${buttonID[3]}`)
                            .setLabel('Cancel Disband')
                            .setStyle('SUCCESS'));

                        const disbandEmbed = new MessageEmbed()
                            .setTitle(`Subteam Disband`)
                            .setColor("#ff0f0f")
                            .setDescription(`<@${buttonID[2]}>, this action cannot be undone. Confirm deletion of the ${buttonID[3]} Subteam?`)

                        await interaction.update({
                            embeds: [disbandEmbed],
                            components: [disbandRow]
                        });

                    } else if (buttonID[4] == 2) {
                        // This is the second "yes"

                        // Delete subteam and tell the user its been done.

                        const disbandRow = new MessageActionRow()
                            .addComponents(new MessageButton()
                                .setCustomID(`STD|Y|${buttonID[2]}|${buttonID[3]}|2`)
                                .setLabel('Confirm Disband')
                                .setDisabled(true)
                                .setStyle('DANGER'));
                        disbandRow.addComponents(new MessageButton()
                            .setCustomID(`STD|N|${buttonID[2]}|${buttonID[3]}`)
                            .setLabel('Cancel Disband')
                            .setDisabled(true)
                            .setStyle('SUCCESS'));


                        const embed = new MessageEmbed()
                            .setTitle(`Subteam Disbanded`)
                            .setColor("#ff0f0f")
                            .setDescription(`<@${buttonID[2]}>, your subteam \`${buttonID[3]}\` was disbanded.`)

                        await interaction.update({
                            embeds: [embed],
                            components: [disbandRow]
                        });

                        await client.channels.cache.get(process.env.JOIN).send(`<@${buttonID[2]}>`, embed);

                        const deletedNotice = new MessageEmbed()
                            .setTitle(`Subteam Disbanded `)
                            .setColor("#f7cba6")
                            .setDescription(` The Subteam Leader, <@${buttonID[2]}>, has disbanded the \`${buttonID[3]}\` Subteam.`)

                        let subteamData = client.getSubteamByUser(buttonID[2])

                        subteamData.then(function (result) {
                            let roleToRemove = interaction.guild.roles.fetch(result[0].role)

                            roleToRemove.then((roleData) => {

                                result[0].members.forEach(member => {

                                    // Remove the role from each member
                                    let user = interaction.guild.members.fetch(member.userID)
                                    user.then((userData) => {
                                        userData.roles.remove(roleData, `Removed the role ${roleData.name} from ${client.users.cache.get(userData.username)}.`)
                                    })

                                });

                            })

                            client.DisbandSubteam(buttonID[2]).then(interaction.channel.send("<@474034125582499840>", deletedNotice))
                        })
                    }

                } else if (buttonID[1] == "N") {
                    // They choose no, exit.

                    const embed = new MessageEmbed()
                        .setTitle(`Subteam Disband Canceled`)
                        .setColor("#ff0f0f")
                        .setDescription(`<@${buttonID[2]}>, your subteam disband for ${buttonID[3]} was canceled.`)

                    await interaction.update({
                        embeds: [embed],
                        components: []
                    });

                }

                break;
            case "STJR":

                if (interaction.user.id != buttonID[3]) return

                if (buttonID[1] == "A") {
                    // Owner accepted 

                    let subteamByUser = client.getSubteamByUser(buttonID[3])

                    subteamByUser.then(function (result) {

                        let subteam = result[0]

                        // Check if they are already in the subteam
                        let howManySubteams = client.GetAllSubteamsByMember(buttonID[4])

                        howManySubteams.then(function (numberOfSubteams) {

                            let joinLimit = 3

                            if (interaction.member.roles.cache.get(process.env.TIER3)) joinLimit = 5
                            else if (interaction.member.roles.cache.get(process.env.TIER2)) joinLimit = 4
                            else if (interaction.member.roles.cache.get(process.env.TIER1)) joinLimit = 4

                            if (numberOfSubteams >= joinLimit) return JoinError(client, buttonID[4], process.env.JOIN, `your request to join \`${buttonID[2]}\`'s Subteam was accepted. However, you are at your subteam join limit of ${joinLimit}. Please consider leaving another subteam or subscribing to our [Patreon](https://www.patreon.com/dwain).`)
                            if (subteam.members.some(e => e.userID === buttonID[4])) return 
                            if (subteam.members.length == subteam.capacity) return JoinError(client, buttonID[4], process.env.JOIN, `your request to join \`${buttonID[2]}\`'s Subteam was accepted. However, the subteam is currently full. Please request to join again when there is space. You can check using \`/info (subteam)\``)

                            else {
                                // No errors 

                                JoinAccept(client, buttonID[4], subteam.channel, `your request to join \`${buttonID[2]}\` Subteam was accepted, Welcome!`)

                                // Add them to the subteam
                                client.addUserToSubteam(buttonID[3], buttonID[4])

                                // Assign the role
                                let roleToAdd = interaction.guild.roles.fetch(result[0].role)

                                roleToAdd.then((roleData) => {

                                    let user = interaction.guild.members.fetch(buttonID[4])
                                    user.then((userToAddRoleTo) => {
                                        userToAddRoleTo.roles.add(roleData, `Added the role ${roleData.name} to ${userToAddRoleTo.user.username}.`)
                                    })
                                })

                            }

                            // Disable buttons

                            const row = new MessageActionRow()
                                .addComponents(new MessageButton()
                                    .setCustomID(`STJR|A`)
                                    .setLabel('Accept')
                                    .setStyle('SUCCESS')
                                    .setDisabled(true));

                            row.addComponents(new MessageButton()
                                .setCustomID(`STJR|D`)
                                .setLabel('Deny')
                                .setStyle('DANGER')
                                .setDisabled(true));


                            return interaction.update({
                                components: [row]
                            });

                        })
                    })

                } else if (buttonID[1] == "D") {
                    // Owner Denied 

                    const row = new MessageActionRow()
                        .addComponents(new MessageButton()
                            .setCustomID(`STJR|A`)
                            .setLabel('Accept')
                            .setStyle('SUCCESS')
                            .setDisabled(true));

                    row.addComponents(new MessageButton()
                        .setCustomID(`STJR|D`)
                        .setLabel('Deny')
                        .setStyle('DANGER')
                        .setDisabled(true));


                    await interaction.update({
                        components: [row]
                    });

                    return JoinDeny(client, buttonID[4], process.env.JOIN, `your request to join \`${buttonID[2]}\` Subteam was rejected.`)

                }

                break;
            case "STL":

                if (interaction.member.id != buttonID[3]) return

                page = buttonID[1]

                client.GetAllSubteams().then(function (subteams) {

                    let lastPage = Math.ceil(subteams.length / 5)
                    let goto = Number(buttonID[1])

                    if (buttonID[2] == "L") {
                        // They are on page 1 and hit the left button, find the last page and take them to it
                        if (page == 1) goto = lastPage
                        // They choose left - 1 from the current number
                        else goto--

                    } else if (buttonID[2] == "R") {
                        // They choose right + 1 to the current number
                        if (page == lastPage) goto = 1

                        else goto++

                    }

                    // Render the new page
                    const row = new MessageActionRow()
                        .addComponents(new MessageButton()
                            .setCustomID(`STL|${goto}|L|${buttonID[3]}`)
                            .setEmoji("⬅️")
                            .setStyle('PRIMARY'));

                    row.addComponents(new MessageButton()
                        .setCustomID(`STL|${goto}|R|${buttonID[3]}`)
                        .setEmoji("➡️")
                        .setStyle('PRIMARY'));

                    const newList = [...subteams];

                    let numToPop = (goto - 1) * 5

                    newList.splice(0, numToPop);

                    newList.splice(5, newList.length);

                    const embed = new MessageEmbed()
                        .setColor('#f7cba6')
                        .setTitle('List of all active subteams')
                        .setDescription('To view more info on a subteam do `/subteam info (Subteam)`')
                        .setFooter(`Page Number ${goto}`)

                    newList.forEach(subteam => {
                        embed.addField(`Subteam: ${subteam.name}`, `Overview: ${subteam.overview}`, false)
                    });

                    interaction.update({
                        embeds: [embed],
                        components: [row]
                    });

                })

                break;
            case "STT":

                if (interaction.member.id != buttonID[3]) return

                page = buttonID[1]

                client.SubteamTopList().then(function (subteams) {

                    let lastPage = Math.ceil(subteams.length / 5)
                    let goto = Number(buttonID[1])

                    if (buttonID[2] == "L") {
                        // They are on page 1 and hit the left button, find the last page and take them to it
                        if (page == 1) goto = lastPage
                        // They choose left - 1 from the current number
                        else goto--

                    } else if (buttonID[2] == "R") {
                        // They choose right + 1 to the current number
                        if (page == lastPage) goto = 1

                        else goto++

                    }

                    // Render the new page
                    const row = new MessageActionRow()
                        .addComponents(new MessageButton()
                            .setCustomID(`STT|${goto}|L|${buttonID[3]}`)
                            .setEmoji("⬅️")
                            .setStyle('PRIMARY'));

                    row.addComponents(new MessageButton()
                        .setCustomID(`STT|${goto}|R|${buttonID[3]}`)
                        .setEmoji("➡️")
                        .setStyle('PRIMARY'));

                    const newList = [...subteams];

                    let numToPop = (goto - 1) * 5

                    newList.splice(0, numToPop);

                    newList.splice(5, newList.length);

                    const embed = new MessageEmbed()
                        .setColor('#f7cba6')
                        .setTitle('List of all active subteams')
                        .setDescription('To view more info on a subteam do `/subteam info (Subteam)`')
                        .setFooter(`Page Number ${goto}`)


                    newList.forEach(subteam => {
                        embed.addField(`Subteam: ${subteam.name}`, `**XP:** ${Math.floor(subteam.xp)}\n**Level:** ${Math.floor(subteam.xp / 1500)}`, false)
                    });

                    interaction.update({
                        embeds: [embed],
                        components: [row]
                    });

                })

                break;
            case "STK":

                if (buttonID[1] == "A") {

                    const row = new MessageActionRow()
                        .addComponents(new MessageButton()
                            .setCustomID(`STK|A`)
                            .setLabel('YES')
                            .setStyle('DANGER')
                            .setDisabled(true));

                    row.addComponents(new MessageButton()
                        .setCustomID(`STK|D`)
                        .setLabel('NO')
                        .setStyle('SUCCESS')
                        .setDisabled(true));

                    const kickEmbed = new MessageEmbed()
                        .setTitle(`Subteam Kick Confirmed`)
                        .setColor("#f7cba6")
                        .setDescription(`<@${interaction.user.id}>, <@${buttonID[2]}> has been kicked.`)

                    let data = client.getSubteamByUser(interaction.user.id)

                    data.then(function (result) {

                        if (!result) return interaction.update("ERROR: You can only kick members who are in a subteam you own.", {
                            ephemeral: true,
                        })

                        if (!result[0].members.some(e => e.userID === interaction.user.id)) return interaction.update("ERROR: You can only kick members who are in a subteam you own.", {
                            ephemeral: true,
                        })

                        interaction.update({
                            ephemeral: true,
                            embeds: [kickEmbed],
                            components: [row]
                        });

                        client.removeUserFromSubteam(interaction.user.id, buttonID[2])

                        let roleToRemove = interaction.guild.roles.fetch(buttonID[3])

                        const kicked = new MessageEmbed()
                            .setTitle(`Subteam Kick Notice`)
                            .setColor("#f7cba6")
                            .setDescription(`<@${buttonID[2]}>, You were kicked from a subteam.`)
                        client.channels.cache.get(process.env.JOIN).send(`<@${buttonID[2]}>`, kicked);


                        roleToRemove.then((roleData) => {
                            let user = interaction.guild.members.fetch(buttonID[2])
                            user.then((userToRemoveRoleFrom) => {
                                userToRemoveRoleFrom.roles.remove(roleData, `Removed the role ${roleData.name} from ${userToRemoveRoleFrom.user.username}.`)
                            })
                        })
                    })

                } else {

                    const row = new MessageActionRow()
                        .addComponents(new MessageButton()
                            .setCustomID(`STK|A`)
                            .setLabel('YES')
                            .setStyle('DANGER')
                            .setDisabled(true));

                    row.addComponents(new MessageButton()
                        .setCustomID(`STK|D`)
                        .setLabel('NO')
                        .setStyle('SUCCESS')
                        .setDisabled(true));

                    const kickEmbed = new MessageEmbed()
                        .setTitle(`Subteam Kick Cancelled`)
                        .setColor("#f7cba6")
                        .setDescription(`<@${interaction.user.id}>, <@${buttonID[2]}>'s kick has been Cancelled.`)

                    interaction.update({
                        ephemeral: true,
                        embeds: [kickEmbed],
                        components: [row]
                    });

                }

                break;
        }
    }
}
