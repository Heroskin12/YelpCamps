const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { checkReturnTo } = require('../middleware');

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async(req, res, next) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Account successfully created. Welcome to YelpCamp!');
            res.redirect('/campgrounds');        
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', checkReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectURL = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectURL);
})

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
          return next(err);
        }
        req.flash('success', 'You have been successfully logged out. Goodbye!');
        res.redirect('/campgrounds');
    });
})
module.exports = router;