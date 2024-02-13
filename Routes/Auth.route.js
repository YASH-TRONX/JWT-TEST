const express = require('express');
const router = express.Router();
const createError = require('http-errors');

const User = require('../Models/User.model');

router.post('/register', async (req, res, next) => {
    try{
        const {username, email, password} = req.body;
        if(!username || !email || !password) throw createError.BadRequest()

        const doesExist = await User.findOne({email: email});
        if(doesExist) throw createError.Conflict(`${email} is already registered`);

        const user = new User({username, email, password});

        const saveUser = await user.save()


        res.send(saveUser);
    }catch(error){
        next(error)
    }
})

router.post('/login', async (req, res, next) => {
    res.send('login route');
})

router.post('/refresh-token', async (req, res, next) => {
    res.send('refresh token route');
})

router.delete('/logout', async (req, res, next) => {
    res.send('logout route');
})




module.exports = router