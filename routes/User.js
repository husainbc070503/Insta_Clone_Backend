require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/GenerateToken');
const FetchUser = require('../middleware/FetchUser');
const Post = require('../models/Post');
const router = require('express').Router();
const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');

const sendMail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: true,
        auth: {
            user: process.env.USER,
            pass: process.env.PASSWORD
        },
        tls: { rejectUnauthorized: false }
    });

    const options = {
        from: process.env.USER,
        to: email,
        subject: 'Instgram Clone OTP',
        html: `<h4>Your one time password for updation of your password is ${otp}. It is valid for only 5 mins. Please do not share it with anyone. <br /> Thanking You!</h4>`
    }

    await new Promise((resolve, reject) => {
        transporter.sendMail(options, (err, info) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log('Email sent successfully.');
                resolve(info);
            }
        })
    })
}

router.post('/register', async (req, res) => {
    const { name, email, instaId, password, profile } = req.body;

    try {
        if (!name || !email || !instaId || !password)
            return res.status(400).json({ success: false, message: 'Please fill all the required fields!' });

        var user = await User.findOne({ email });
        if (user)
            return res.status(400).json({ success: false, message: 'User fetched with same email. Please login.' });

        user = await User.findOne({ instaId });
        if (user)
            return res.status(400).json({ success: false, message: 'Similar Insta ID has already been taken by some other. Try some unique.' });

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        user = await User.create({ name, email, instaId, password: secPass, profile });
        res.status(200).json({ success: true, user });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});


router.post('/login', async (req, res) => {
    const { instaId, password } = req.body;

    try {
        if (!instaId || !password)
            return res.status(400).json({ success: false, message: 'Please fill all the required fields!' });

        var user = await User.findOne({ instaId });
        if (!user)
            return res.status(400).json({ success: false, message: 'Invalid Credentials.' });

        const result = await bcrypt.compare(password, user.password);
        if (!result)
            return res.status(400).json({ success: false, message: 'Invalid Credentials.' });

        user = await User.findById(user._id).populate('followers').populate('following');

        console.log(generateToken(user._id));
        res.status(200).json({ success: true, user: { user, token: generateToken(user._id) } });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});


router.get('/getFollowers', FetchUser, async (req, res) => {
    try {
        const followers = await User.findById(req.user._id).select('followers').populate('followers');
        res.status(200).json({ success: true, followers });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});


router.get('/getFollowings', FetchUser, async (req, res) => {
    try {
        const followings = await User.findById(req.user._id).select('following').populate('following');
        res.status(200).json({ success: true, followings });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});


router.put('/follow', FetchUser, async (req, res) => {
    const { user } = req.body;

    try {
        const following = await User.findByIdAndUpdate(user, { $push: { followers: req.user._id } }, { new: true })
            .populate('following')
            .populate('followers');
        ;

        const followed = await User.findByIdAndUpdate(req.user._id, { $push: { following: user } }, { new: true })
            .populate('following')
            .populate('followers');

        res.status(200).json({ success: true, res: { followed, following } });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});


router.put('/unfollow', FetchUser, async (req, res) => {
    const { user } = req.body;

    try {
        const unfollowing = await User.findByIdAndUpdate(user, { $pull: { followers: req.user._id } }, { new: true })
            .populate('following')
            .populate('followers');
        ;

        const unfollowed = await User.findByIdAndUpdate(req.user._id, { $pull: { following: user } }, { new: true })
            .populate('following')
            .populate('followers');
        ;

        res.status(200).json({ success: true, res: { unfollowed, unfollowing } });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});


router.put('/addBookmark', FetchUser, async (req, res) => {
    const { post } = req.body;

    try {
        const populatedPost = await Post.findById(post).populate('user');
        const bookmark = await User.findByIdAndUpdate(req.user._id, { $push: { bookmarks: populatedPost } }, { new: true });
        res.status(200).json({ success: true, bookmark });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});


router.put('/removeBookmark', FetchUser, async (req, res) => {
    const { post } = req.body;

    try {
        const bookmark = await User.findByIdAndUpdate(req.user._id, { $pull: { bookmarks: post } }, { new: true });
        res.status(200).json({ success: true, bookmark });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});


router.get('/getBookmarks', FetchUser, async (req, res) => {
    try {
        const marks = await User.findById(req.user._id).select('bookmarks').populate('bookmarks');
        res.status(200).json({ success: true, marks });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


router.put('/updateProfile', FetchUser, async (req, res) => {
    const { name, email, instaId, profile, bio } = req.body;

    try {
        const user = await User.findByIdAndUpdate(req.user._id, { name, email, instaId, profile, bio }, { new: true });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
})


router.get('/searchUser', FetchUser, async (req, res) => {
    const getUser = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { instaId: { $regex: req.query.search, $options: "i" } }
        ]
    } : { success: false, message: "No users fetched." };

    try {
        const users = await User.find(getUser)
            .find({ _id: { $ne: req.user._id } })
            .populate('followers')
            .populate('following');

        res.status(200).json({ success: true, users });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


router.get('/user/:id', FetchUser, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('followers')
            .populate('following')

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
})


router.post('/sendOtp', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user)
            res.status(400).json({ success: false, message: 'User could not be fetched. Please register.' });

        const otp = await Otp.create({
            email,
            otp: Math.floor(Math.random() * 10000),
            expiresIn: new Date().getTime() * 5 * 60 * 1000
        })

        sendMail(email, otp.otp);
        res.status(200).json({ success: true, otp });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


router.put('/changePassword', async (req, res) => {
    const { otp, password, email } = req.body;

    try {
        const validOtp = await Otp.findOne({ email, otp });

        if (validOtp) {
            const diff = validOtp.expiresIn - new Date().getTime();

            if (diff < 0)
                return res.status(400).json({ success: false, message: 'OTP Expired' });

            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(password, salt);

            const user = await User.findOneAndUpdate({ email }, { password: secPass }, { new: true });
            res.status(200).json({ success: true, user });
        }
        else {
            return res.status(400).json({ success: false, message: 'Invalid OTP' })
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});


module.exports = router