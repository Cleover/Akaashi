const userMap = new Map()
const TIME = 30000;

const tierCheck = new Map()
const TIER_TIME = 86400000;

module.exports = async (client, message) => {

    if (message.author.bot || !message.guild) return;


    if (message.content.toLowerCase() == "add tier1" || message.content.toLowerCase() == "add tier2" || message.content.toLowerCase() == "add tier3" || message.content.toLowerCase() == "remove tier1" || message.content.toLowerCase() == "remove tier2" || message.content.toLowerCase() == "remove tier3") {

        let split = message.content.toLowerCase().split(" ")

        message.guild.roles.fetch(process.env[split[1].toUpperCase()]).then(role => {
            message.member.roles[split[0]](role)
            return message.reply(`${split[0]}ed ${split[1]}`)
        })
    }

    if(message.author.id == "850830003696435260" || message.author.id == "343443917267664906"){

    let split = message.content.toLowerCase().split(" ")

    if(split[0] == "get"){
    let howManySubteams = client.GetAllSubteamsByMember(split[1])

    howManySubteams.then(function (numberOfSubteams) {
        message.reply(numberOfSubteams)
    })
    }else if(split[0] == "say"){

        let unEdited = [...split]
        
        unEdited.shift()
        unEdited.shift()

        let message = unEdited.join(" ")

        client.channels.cache.get(split[1]).send(message);

    }else if (split[0] == "top"){
        return message.reply(JSON.stringify(client.SubteamTopList()))
    }

    }

    if (userMap.has(message.author.id)) return
    else {

        let subteamCheck = client.getSubteamByChannel(message.channel.id)

        subteamCheck.then(function (subteam) {

            if (!subteam) return

            let level = Math.floor(subteam[0].xp / 1500)

            if (level + 50 != subteam[0].capacity) {
                client.editSubteam(subteam[0].owner, "capacity", 50 + level)
            }

            if (tierCheck.has(subteam[0].owner)) {
                switch (tierCheck.get(subteam[0].owner).role) {
                    case "tier2":
                        // Add 1.25x xp
                        client.editSubteam(subteam[0].owner, "xp", subteam[0].xp + 1.25)
                        break;
                    case "tier3":
                        // Add 1.5x xp
                        client.editSubteam(subteam[0].owner, "xp", subteam[0].xp + 1.5)
                        break;

                    default:
                        // Add 1x xp
                        client.editSubteam(subteam[0].owner, "xp", subteam[0].xp + 1)
                        break;
                }
            } else {

                // Cache if the owner has the role

                let user = message.guild.members.fetch(subteam[0].owner).then(userData => {

                    let tier2 = userData.roles.cache.get(process.env.TIER2)
                    let tier3 = userData.roles.cache.get(process.env.TIER3)

                    let role = "none"

                    if (tier3) role = "tier3"
                    else if (tier2) role = "tier2"

                    let fn = setTimeout(() => {
                        tierCheck.delete(subteam[0].owner);
                    }, TIER_TIME);
                    tierCheck.set(subteam[0].owner, {
                        timer: fn,
                        role: role
                    })

                    switch (tierCheck.get(subteam[0].owner).role) {
                        case "tier2":
                            // Add 1.25x xp
                            client.editSubteam(subteam[0].owner, "xp", Number(subteam[0].xp) + 1.25)
                            break;
                        case "tier3":
                            // Add 1.5x xp
                            client.editSubteam(subteam[0].owner, "xp", Number(subteam[0].xp) + 1.5)
                            break;

                        default:
                            // Add 1x xp
                            client.editSubteam(subteam[0].owner, "xp", Number(subteam[0].xp) + 1)
                            break;
                    }
                })

            }

        })

        let fn = setTimeout(() => {
            userMap.delete(message.author.id);
        }, TIME);
        userMap.set(message.author.id, {
            timer: fn
        });
    }

}