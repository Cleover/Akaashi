const mongoose = require('mongoose');

const subteamSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,

    // Required
    owner: { type: String, require: true },
    name: { type: String, require: true },
    channel: { type: String, require: true },
    role: { type: String, require: true },
    color: { type: String, require: true },
    overview: { type: String, require: true },
    description: { type: String, require: true },

    // Guild Level
    xp: { type: Number, require: true }, // When checking a guild profile the level will be calcuated rather then showing the xp, or showing both
    capacity: { type: Number, require: true }, // 50 for Tier 2 / 70 for Tier 3 --> this number will be added to as they reach the xp / level required

    // Members 
    members: { type: Array, require: true },

    // Not Required
    banner: { type: String, require: false },
    thumbnail: { type: String, require: false },

});

module.exports = mongoose.model('Subteam', subteamSchema);