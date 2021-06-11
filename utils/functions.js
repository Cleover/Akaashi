const mongoose = require('mongoose');
const {
    Subteam,
} = require('../models');

module.exports = client => {

    client.createSubteam = async (settings) => {
        let merged = Object.assign(settings);

        const newSubteam = await new Subteam(merged);
        return newSubteam.save().then(() => {

            // Add it to all the lists
            client.UpdateSubteamSlashList()
            console.log(`The Subteam "${merged.name}" Was Created!`)

        });
    };

    client.getSubteamByUser = async (userID) => {
        let data = await Subteam.find({
            owner: userID
        });
        if (data.length > 0) return data;
        else return console.log(`No Subteams Found`)
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
                        let subteamData = {
                            name: element.name,
                            value: element.owner
                        }
                        arr.push(subteamData)
                    }
                });
            }

            client.commands.forEach(val => {
                helpArr.push({
                    name: val.data.name,
                    value: val.data.name
                })
            })

            const data = {
                name: "subteam",
                description: "Subteam Commands",
                options: [{
                        name: "create",
                        description: "Create A Subteam (Requires Teir 2 Or Tier 3 on Patron)",
                        type: 1,
                        options: [{
                                name: "subteam-name",
                                description: "What's the name of the subteam your making?",
                                type: 3,
                                required: true
                            },
                            {
                                name: "channel-name",
                                description: "What's the name of the channel that will host your subteam?",
                                type: 3,
                                required: true
                            },
                            {
                                name: "short-description",
                                description: "What is a short description for your subteam? (shown on the `/subteam list`)",
                                type: 3,
                                required: true
                            },
                            {
                                name: "description",
                                description: "What is a long description for your subteam (shown on `/subteam info your_subteam_name`)",
                                type: 3,
                                required: true
                            },
                            {
                                name: "role-name",
                                description: "What's the name of the role for your subteam?",
                                type: 3,
                                required: false
                            },
                            {
                                name: "role-color",
                                description: "What's the color of the role for your subteam? (Must be in a #HEX_CODE format)",
                                type: 3,
                                required: false
                            },
                            {
                                name: "banner",
                                description: "A Imgur Link to a image/gif for your subteam banner (shown below subteam info on `/subteam info`)",
                                type: 3,
                                required: false
                            },
                            {
                                name: "thumbnail",
                                description: "A Imgur Link to a image/gif for your subteam thumbnail (Shown in top right of subteam info embed)",
                                type: 3,
                                required: false
                            },
                        ]
                    },
                    {
                        name: "edit",
                        description: "Edits Your Subteam (Requires you to own a subteam)",
                        type: 1,
                        options: [{
                                name: "subteam-name",
                                description: "What's the name of the subteam your making?",
                                type: 3,
                                required: false
                            },
                            {
                                name: "channel-name",
                                description: "What's the name of the channel that will host your subteam?",
                                type: 3,
                                required: false
                            },
                            {
                                name: "role-name",
                                description: "What's the name of the role for your subteam?",
                                type: 3,
                                required: false
                            },
                            {
                                name: "role-color",
                                description: "What's the color of the role for your subteam? (Must be in a #HEX_CODE format)",
                                type: 3,
                                required: false
                            },
                            {
                                name: "short-description",
                                description: "What is a short description for your subteam? (shown on the `/subteam list`)",
                                type: 3,
                                required: false
                            },
                            {
                                name: "description",
                                description: "What is a long description for your subteam (shown on `/subteam info your_subteam_name`)",
                                type: 3,
                                required: false
                            },
                            {
                                name: "banner",
                                description: "A Imgur Link to a image/gif for your subteam banner (shown below subteam info on `/subteam info`)",
                                type: 3,
                                required: false
                            },
                            {
                                name: "thumbnail",
                                description: "A Imgur Link to a image/gif for your subteam thumbnail (Shown in top right of subteam info embed)",
                                type: 3,
                                required: false
                            },
                        ]
                    }, {
                        name: "kick",
                        description: "Kick A user from a subteam you own",
                        type: 1,
                        options: [{
                            name: "user",
                            description: "Which user would you like to Kick? Start typing to filter list",
                            type: 6,
                            required: true,
                        }, ]
                    },
                    {
                        name: "disband",
                        description: "Deletes Your Subteam (Requires you to own a subteam). There will be conformation after this is run",
                        type: 1,
                    },
                    {
                        name: "join",
                        description: "Join A existing subteam",
                        type: 1,
                        options: [{
                                name: "subteam",
                                description: "Which subteam would you like to join? Start typing to filter list",
                                type: 3,
                                required: true,
                                choices: arr
                            },
                            {
                                name: "message",
                                description: "Message to be sent along with your application, this can be used to answer questions, etc",
                                type: 3,
                                required: false
                            },
                        ]
                    }, {
                        name: "leave",
                        description: "Leave a subteam your a part of",
                        type: 1,
                        options: [{
                            name: "subteam",
                            description: "Which subteam would you like to leave? Start typing to filter list (This will list all subteams)",
                            type: 3,
                            required: true,
                            choices: arr
                        }]
                    },
                    {
                        name: "list",
                        description: "List all currently active subteams",
                        type: 1,
                    },
                    {
                        name: "leaderboard",
                        description: "List the top subteams",
                        type: 1,
                    },
                    {
                        name: "info",
                        description: "Get more info on a specific subteam from the subteam list command",
                        type: 1,
                        options: [{
                            name: "subteam",
                            description: "Which subteam would you like to join? Start typing to filter list",
                            type: 3,
                            required: true,
                            choices: arr
                        }, ]
                    },
                    {
                        name: "help",
                        description: "Get more info on the commands",
                        type: 1,
                        options: [{
                            name: "command",
                            description: "Which command do you need help with?",
                            type: 3,
                            required: false,
                            choices: helpArr
                        }, ]
                    },
                    {
                        name: "test",
                        description: "Example join command",
                        type: 1,
                        options: [{
                            name: "owner",
                            description: "What is the owner of the subteam you would like to join?",
                            type: 6,
                            required: true,
                        }, ]
                    },
                ]
            }

            const command = client.guilds.cache.get(process.env.DISCORD)?.commands.create(data);
        })


    }

}