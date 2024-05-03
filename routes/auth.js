const express = require('express');
const User = require('../models/user');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendResetEmail } = require('./emailService');
const crypto = require('crypto');


const JWT_SECRET = 'NileshKumar$G'

//ROUTE 1.: API for Create a user using POST request: "/api/auth/createUser".

router.post('/createUser', [
    body('username', ' Enter a username ').isLength({ min: 4 }),
    body('email', ' Enter a valid email ').isEmail(),
    body('password', ' Password must have atleast 6 characters ').isLength({ min: 5 })
], async (req, res) => {

    //If there are errors, return bad request & show errors

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(404).json({ errors: errors.array() });
    }

    //Check whether the user's email already exists

    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(404).json({ error: 'Sorry! This email already exists!' });
        }

        //Create a new user
        const salt = await bcrypt.genSalt(10);
        const SecurePassword = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            username: req.body.username,
            password: SecurePassword,
            email: req.body.email
        });

        const data = {
            user: {
                id: user.id
            }
        }

        const authToken = jwt.sign(data, JWT_SECRET);
        res.status(200).json({ authToken });
    }

    catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error!");
    }
});

//ROUTE 2.: API for Authenticating the user using : POST "/api/auth/login".

router.post('/login', [
    body('username', 'Enter a valid username').exists(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(404).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "Please try logging in using correct credentials!" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(404).json({ error: "Please try logging in using correct credentials!" });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        res.status(200).send(authToken);
    }
    catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error!");
    }
});

//ROUTE 3.: API for Forget User, Password: POST "/api/auth/forgetUser".

router.post('/forgetUser', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found');
        }
        // Generate a password reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
        // Set token and expiry on user model (add these fields to your model)
        user.resetPasswordToken = resetToken;
        user.resePasswordExpires = resetTokenExpiry;
        await user.save();

        // Send email with reset instructions

        await sendResetEmail(email, `Your frontend reset link with token: ${resetToken}`);

        console.log(`Reset token: ${resetToken}`);

        // res.json({resetToken});

        res.status(200).send('Password reset email sent');
    } catch (error) {
        res.status(500).send('Error in password reset process');
    }
});

module.exports = router;