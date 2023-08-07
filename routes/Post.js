const FetchUser = require('../middleware/FetchUser');
const Post = require('../models/Post');
const router = require('express').Router();


router.post('/addPost', FetchUser, async (req, res) => {
    const { image, heading, body, location, postType } = req.body;

    try {
        if (!image || !heading || !body)
            return res.status(400).json({ success: false, message: 'Please fill all the required fields!' });

        var post = await Post.create({ user: req.user._id, image, heading, body, location, postType });
        post = await Post.findById(post._id).populate('user');

        res.status(200).json({ success: true, post });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


router.delete('/deletePost/:id', FetchUser, async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, post });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
})


router.get('/myPosts', FetchUser, async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user._id })
            .populate('user')
            .populate('comments.user')
            .populate('likes')
            .sort('-createdAt');

        res.status(200).json({ success: true, posts });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


router.get('/userPosts/:id', FetchUser, async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.id })
            .populate('user')
            .populate('comments.user')
            .populate('likes')
            .sort('-createdAt');

        res.status(200).json({ success: true, posts });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


router.get('/allPosts', FetchUser, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user')
            .populate('comments.user')
            .populate('likes')
            .sort('-createdAt');

        res.status(200).json({ success: true, posts });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


router.get('/singlePost/:id', FetchUser, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user')
            .populate('likes')
            .populate('comments.user');

        res.status(200).json({ success: true, post })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
})


router.put('/like/:id', FetchUser, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, { $push: { likes: req.user._id } }, { new: true })
            .populate('likes')
            .populate('user');

        res.status(200).json({ success: true, post });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


router.put('/dislike/:id', FetchUser, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id } }, { new: true });
        res.status(200).json({ success: true, post });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


router.put('/addComment/:id', FetchUser, async (req, res) => {
    try {
        const comment = { comment: req.body.comment, user: req.user._id };
        const post = await Post.findByIdAndUpdate(req.params.id, { $push: { comments: comment } }, { new: true })
            .populate('comments.user')
            .populate('user');

        res.status(200).json({ success: true, post });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/deleteComment/:id', FetchUser, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, { $pull: { comments: { _id: req.body.commId } } }, { new: true })
        res.status(200).json({ success: true, post });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


module.exports = router;