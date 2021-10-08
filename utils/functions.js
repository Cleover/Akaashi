const mongoose = require('mongoose');
const {
    Subteam,
    User,
    Guild,
} = require('../models');

const {
    SlashCommandBuilder
} = require('@discordjs/builders');


module.exports = client => {

    client.createGuild = async (settings) => {
        let merged = Object.assign(settings);
        const newGuild = await new Guild(merged);
        return newGuild.save()
    };

    client.getGuildData = async (guildID) => {
        let data = await Guild.findOne({
            id: guildID
        });
        if (data) return data;
        else {
            console.log("No Guild Found. Creating Guild instead...")
            return await client.createGuild({
                "id": guildID
            })
        }
    };

    client.createSubteam = async (settings) => {
        let merged = Object.assign(settings);

        const newSubteam = await new Subteam(merged);
        return newSubteam.save().then(() => {

            // Add it to all the lists
            client.UpdateSubteamSlashList()
            console.log(`The Subteam "${merged.name}" Was Created!`)

        });
    };

    client.createUser = async (settings) => {
        let merged = Object.assign(settings);
        const newUser = await new User(merged);
        return newUser.save()
    };

    client.getSubteamByUser = async (userID) => {
        let data = await Subteam.find({
            owner: userID
        });
        if (data.length > 0) return data;
        else return console.log(`No Subteams Found`)
    };

    client.getUserInGuild = async (guildID, userID) => {
        let data = await User.findOne({
            id: userID,
            guild: guildID
        });
        if (data) return data;
        else {
            console.log(`No User Found. Creating User ${userID}...`)
            let user = await client.createUser({
                "id": userID,
                "guild": guildID
            })
            Guild.findOneAndUpdate({
                    id: guildID
                }, {
                    $push: {
                        users: user._id
                    }
                },
                function (error, success) {
                    if (error) console.log(error);
                    else {
                        console.log(`Created user:${userID}, and added them to guild:${guildID}"`);
                    }
                });
            return user
        }
    };

    client.getSubteamByChannel = async (channelID) => {
        let data = await Subteam.find({
            channel: channelID
        });
        if (data.length > 0) return data;
        else return console.log(`No Subteams Found`)
    };

    client.addUserToSubteam = async (ownerID, member) => {
        Subteam.findOneAndUpdate({
                owner: ownerID
            }, {
                $push: {
                    members: {
                        userID: member
                    }
                }
            },
            function (error, success) {
                if (error) console.log(error);
                else console.log(`Added ${member} to ${ownerID}'s Subteam`);
            });
    };

    client.editSubteam = async (ownerID, type, value) => {

        let obj = {}

        obj[type] = value

        Subteam.findOneAndUpdate({
                owner: ownerID
            }, obj,
            function (error, success) {
                if (error) console.log(error);
                else console.log(`Edited ${type}'s value to ${value} for a ${ownerID}'s subteam.`);
            });

        if (type == "name") client.UpdateSubteamSlashList()
    };

    client.removeUserFromSubteam = async (ownerID, member) => {
        Subteam.findOneAndUpdate({
                owner: ownerID
            }, {
                $pull: {
                    members: {
                        userID: member
                    }
                }
            },
            function (error, success) {
                if (error) console.log(error);
                else console.log(`Removed ${member} from ${ownerID}'s Subteam`);
            });
    };


    client.GetAllSubteams = async () => {
        let data = await Subteam.find()
        if (data.length > 0) return data;
        else return console.log(`No Subteams Found`)
    };

    client.GetAllSubteamsByMember = async (user) => {
        let data = await Subteam.find()
        let arr = 0
        if (data.length > 0) {
            data.forEach(subteam => {
                if (subteam.members.some(e => e.userID === user)) {
                    arr++
                }
            })
        }
        return await arr;
    };

    client.SubteamTopList = async (user) => {
        let data = await Subteam.find().sort({
            xp: -1
        })
        if (data.length > 0) return data;
        else return console.log(`No Subteams Found`)
    };


    client.DisbandSubteam = async (userID) => {
        let data = await Subteam.deleteOne({
            owner: userID
        });
        if (data.length > 0) {
            console.log(`The Subteam Owned By "${userID}" Was Disbanded!`)
            client.UpdateSubteamSlashList()
            return
        } else return console.log(`No Subteams Found`);
    };

    client.UpdateSubteamSlashList = async () => {

        let data = client.GetAllSubteams()
        let arr = []

        let helpArr = []


        data.then(function (result) {
            if (result) {
                result.forEach(element => {
                    if (arr.length != 25) {
                        arr.push([element.name, element.owner])
                    }
                });
            }

            client.commands.forEach(val => {
                helpArr.push({
                    name: val.data.name,
                    value: val.data.name
                })
            })

            const command = (new SlashCommandBuilder()

                // Main command
                .setName('subteam')
                .setDescription('Subteam Commands')

                // Subcommands

                // Create
                .addSubcommand(subcommand =>
                    subcommand
                    .setName('create')
                    .setDescription('Create A Subteam (Requires Teir 2 Or Tier 3 on Patron)')

                    // Required
                    .addStringOption(option => option.setName('subteam-name').setDescription("What's the name of the subteam your making?").setRequired(true))
                    .addStringOption(option => option.setName('channel-name').setDescription("What's the name of the channel that will host your subteam?").setRequired(true))
                    .addStringOption(option => option.setName('short-description').setDescription("What is a short description for your subteam? (shown on the `/subteam list`)").setRequired(true))
                    .addStringOption(option => option.setName('description').setDescription("What is a long description for your subteam (shown on `/subteam info your_subteam_name`)").setRequired(true))

                    // Not Required
                    .addStringOption(option => option.setName('role-name').setDescription("What's the name of the role for your subteam?").setRequired(false))
                    .addStringOption(option => option.setName('role-color').setDescription("What's the color of the role for your subteam? (Must be in a #HEX_CODE format)").setRequired(false))
                    .addStringOption(option => option.setName('banner').setDescription("A Imgur Link to a image/gif for your subteam banner (shown below subteam info on `/subteam info`)").setRequired(false))
                    .addStringOption(option => option.setName('thumbnail').setDescription("A Imgur Link to a image/gif for your subteam thumbnail (Shown in top right of subteam info embed)").setRequired(false))
                    .addStringOption(option => option.setName('emoji').setDescription("A Imgur Link to a image/gif for your subteam emoji").setRequired(false))
                )

                // Edit
                .addSubcommand(subcommand =>
                    subcommand
                    .setName('edit')
                    .setDescription('Create A Subteam (Requires Teir 2 Or Tier 3 on Patron)')

                    // Not Required
                    .addStringOption(option => option.setName('subteam-name').setDescription("What's the name of the subteam your making?").setRequired(false))
                    .addStringOption(option => option.setName('channel-name').setDescription("What's the name of the channel that will host your subteam?").setRequired(false))
                    .addStringOption(option => option.setName('short-description').setDescription("What is a short description for your subteam? (shown on the `/subteam list`)").setRequired(false))
                    .addStringOption(option => option.setName('description').setDescription("What is a long description for your subteam (shown on `/subteam info your_subteam_name`)").setRequired(false))
                    .addStringOption(option => option.setName('role-name').setDescription("What's the name of the role for your subteam?").setRequired(false))
                    .addStringOption(option => option.setName('role-color').setDescription("What's the color of the role for your subteam? (Must be in a #HEX_CODE format)").setRequired(false))
                    .addStringOption(option => option.setName('banner').setDescription("A Imgur Link to a image/gif for your subteam banner (shown below subteam info on `/subteam info`)").setRequired(false))
                    .addStringOption(option => option.setName('thumbnail').setDescription("A Imgur Link to a image/gif for your subteam thumbnail (Shown in top right of subteam info embed)").setRequired(false))
                    .addStringOption(option => option.setName('emoji').setDescription("A Imgur Link to a image/gif for your subteam emoji").setRequired(false))
                )

                // Kick
                .addSubcommand(subcommand =>
                    subcommand
                    .setName('kick')
                    .setDescription('Kick A user from a subteam you own')

                    // Required
                    .addUserOption(option => option.setName('user').setDescription("Which user would you like to Kick? Start typing to filter list").setRequired(true))
                )

                // Disband
                .addSubcommand(subcommand =>
                    subcommand
                    .setName('disband')
                    .setDescription('Deletes Your Subteam (Requires you to own a subteam). There will be conformation after this is run')
                )

                // Join
                .addSubcommand(subcommand =>
                    subcommand
                    .setName('join')
                    .setDescription('Join A existing subteam')

                    // Required
                    // .addStringOption(option => option.setName('subteam').setDescription("Which subteam would you like to join? Start typing to filter list").addChoices(arr).setRequired(true))

                    // Not Required
                    // .addStringOption(option => option.setName('message').setDescription("Message to be sent along with your application, this can be used to answer questions, etc").setRequired(false))
                )

                // setup
                .addSubcommand(subcommand =>
                    subcommand
                    .setName('setup')
                    .setDescription('Setup the bot!~')

                    // Required

                    // Channel
                    .addChannelOption(option => option.setName('accept-deny-channel').setDescription("What channel should be used for sending the subteam edit/creation requests to be accepted/denied?").setRequired(true))
                    .addChannelOption(option => option.setName('notify-channel').setDescription("What channel should be used for sending the subteam notifications? (ie: when a subteam is disbanded)").setRequired(true))
                    
                    // Category
                    .addChannelOption(option => option.setName('subteam-category').setDescription("What category should be used for the created subteams?)").setRequired(true))
                    
                    // Integer 
                    .addIntegerOption(option => option.setName('vote-requirements').setDescription("How many votes should be required to accept/deny a subteam request?").setRequired(true))

                    // Not Required
                    .addStringOption(option => option.setName('emoji-server-id').setDescription("What is the id of the emoji server? (Not required to function)").setRequired(false))
                )

                // // Leave
                // .addSubcommand(subcommand =>
                //     subcommand
                //     .setName('leave')
                //     .setDescription('Join A existing subteam')

                //     // Required
                //     .addStringOption(option => option.setName('subteam').setDescription("Which subteam would you like to leave? Start typing to filter list (This will list all subteams)").addChoices(arr).setRequired(true))
                // )

            ).toJSON()

            const createCommand = client.guilds.cache.get("697607643715338261").commands.create(command);
        })


    }

}