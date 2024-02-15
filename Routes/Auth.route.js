const express = require('express');
const router = express.Router();
const createError = require('http-errors');

const {User, RefToken} = require('../Models/User.model');
const {registerSchema, loginSchema} = require('../helpers/validation_schema');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt_helper');

router.post('/register', async (req, res, next) => {
    try{

        const result = await registerSchema.validateAsync(req.body);

        const doesExist = await User.findOne({email: result.email});

        if(doesExist) throw createError.Conflict(`${result.email} is already registered`);

        const user = new User(result);

        const saveUser = await user.save()


        const accessToken = await signAccessToken(saveUser.id);

        const refreshToken = await signRefreshToken(saveUser.id);

        const newToken = new RefToken({status: true, accessToken, refreshToken});

        await newToken.save();


        res.send({accessToken, refreshToken});
    }catch(error){
        next(error)
    }
})

router.post('/login', async (req, res, next) => {
    try{
        const result = await loginSchema.validateAsync(req.body);

        const user = await User.findOne({email: result.email});

        if(!user) throw createError.NotFound('user not registered');

        const isMatch = await user.isValidPassword(result.password);

        if(!isMatch) throw createError.Unauthorized('Username/password not valid');

        const accessToken = await signAccessToken(user.id);

        const refreshToken = await signRefreshToken(user.id);

        const newToken = new RefToken({status: true, accessToken, refreshToken});

        await newToken.save();

        res.send({accessToken, refreshToken});
    }catch(error){
        if(error.isJoi === true) return next(createError.BadRequest('error username/password'));
        next(error)
    }
})

router.post('/refresh-token', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if(!refreshToken) throw createError.BadRequest();

        const userId = await verifyRefreshToken(refreshToken);

        if(userId) await RefToken.findOneAndUpdate({refreshToken}, {status: false});

        const accessToken = await signAccessToken(userId);

        const refToken = await signRefreshToken(userId);

        const newToken = new RefToken({status: true, accessToken, refreshToken: refToken});

        await newToken.save();

        res.send({accessToken, refreshToken: refToken});
    } catch (error) {
        next(error)
    }
})

router.delete('/logout', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if(!refreshToken) throw createError.BadRequest();

        const userId = await verifyRefreshToken(refreshToken);

        if(userId) await RefToken.findOneAndUpdate({refreshToken}, {status: false});

        const user = await User.findOne({_id: userId});

        res.send({response: `${user.email} logged out`});

    } catch (error) {
        next(error)
    }
})




module.exports = router