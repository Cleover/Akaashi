const mongoose = require('mongoose');
const userSchema = require('./user');
const subteamSchema = require('./subteam');

const guildSchema = mongoose.Schema({

    // Required
    id: { type: String, require: true },
    users: { type: Array, require: false },
    subteams: { type: Array, require: false },

    settings: {

        // Channels
        accept_deny_channel: { type: String, require: true },
        notify_channel: { type: String, require: true },

        // Category
        subteam_category: { type: String, require: true },

        // Servers
        emoji_server: { type: String, require: true },

        // Variables
        require: { type: String, require: true },

    }

});

module.exports = mongoose.model('Guild', guildSchema);
