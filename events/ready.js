module.exports = async (client) => {
    console.log(
        `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
    );

    client.user.setActivity(
        `With volley-balls? idk I haven't watched the show.`
    );

    client.UpdateSubteamSlashList();

}