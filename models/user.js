const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,

    // Required
    id: { type: String, require: true },
    guild: { type: String, require: true },

    // Settings
    lang: { type: String, default: "en", require: true },

    // Level
    xp: { type: Number, require: true }, // When checking a guild profile the level will be calcuated rather then showing the xp, or showing both


});

module.exports = mongoose.model('User', userSchema);