const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
    },

    instaId: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    profile: {
        type: String,
    },

    bio: {
        type: String,
        trim: true,
    },

    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],

    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],

    bookmarks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post'
        }
    ]

}, {
    timestamps: true
});

const User = mongoose.model('user', UserSchema);

module.exports = User