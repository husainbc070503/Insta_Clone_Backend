const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    image: {
        type: String,
        required: true,
    },

    heading: {
        type: String,
        required: true,
    },

    body: {
        type: String,
        required: true,
    },

    location: {
        type: String,
        required: true
    },

    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }
    ],

    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
            },

            comment: {
                type: String,
                required: true,
            }
        }
    ],

    postType: {
        type: String,
        default: "image"
    }

}, {
    timestamps: true
});

const Post = mongoose.model('post', PostSchema);

module.exports = Post