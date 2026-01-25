const createError = require('http-errors');

const {User, RefToken, mPin} = require('../Models/User.model');
const {registerSchema, loginSchema} = require('../helpers/validation_schema');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt_helper');



module.exports = {
    register: async (req, res, next) => {
        try{
            // validate initial user data input with all req data to register
            const result = await registerSchema.validateAsync(req.body);
    
            //check if email exist previously in db i.e. user already having acc
            const doesExist = await User.findOne({email: result.email});
    
            // if mail exists, then return back error mentioned user already exists
            if(doesExist) throw createError.Conflict(`${result.email} is already registered`);
    
            // move aheead with new user creation
            const user = new User(result);
    
            //save new user data
            const saveUser = await user.save()

            // generate user access token with user id
            const accessToken = await signAccessToken(saveUser.id);
    
            // generate user refresh token with user id
            const refreshToken = await signRefreshToken(saveUser.id);
    
            // create new token object with status true i.e active
            const newToken = new RefToken({status: true, accessToken, refreshToken});
    
            // save the new token object
            await newToken.save();
    
            // return success with token and mpin info data
            res.send({accessToken, refreshToken, mPinSet: false});
        }catch(error){
            // catch any error if occured in between
            next(error)
        }
    },
    login: async (req, res, next) => {
        try{
            // validate req with defined schema for login api
            const result = await loginSchema.validateAsync(req.body);
    
            // check user data if the email provided already exists i.e. user already registered
            const user = await User.findOne({email: result.email});
    
            // throw error user if user not present
            if(!user) throw createError.NotFound('user not registered');
    
            //check password if validates and is correct
            const isMatch = await user.isValidPassword(result.password);
    
            // password fails to match or invalid
            if(!isMatch) throw createError.Unauthorized('Username/password not valid');
    
            // check if mpin exists for the user
            const mPinExist = await mPin.findOne({email: result.email});

            // grant or assign a session token to the user loggin in
            const accessToken = await signAccessToken(user.id);
    
            // grant or assign a refresh token to the user for token refresh
            const refreshToken = await signRefreshToken(user.id);
    
            //generate and save new refToken(object storing current active tokens)
            const newToken = new RefToken({status: true, accessToken, refreshToken});
    
            // saving the refToken object
            await newToken.save();
    
            // send response with user name, accesstoken, refreshToken, mpinSet value
            res.send({username: user.username, accessToken, refreshToken, mPinSet: mPinExist ? true : false});
        }catch(error){
            //catch any bad request
            if(error.isJoi === true) return next(createError.BadRequest('error username/password'));
            next(error)
        }
    },
    refreshToken: async (req, res, next) => {
        try {
            // refresh token taken from req body
            const { refreshToken } = req.body;

            // if not present then reject request
            if(!refreshToken) throw createError.BadRequest();
    
            // verify refresh token if active from token table
            const userId = await verifyRefreshToken(refreshToken);
    
            //find and flag old refresh token to false state before creating new token
            if(userId) await RefToken.findOneAndUpdate({refreshToken}, {status: false});
    
            // create new access token with user id
            const accessToken = await signAccessToken(userId);
    
            // create new refresh token with user id
            const refToken = await signRefreshToken(userId);
    
            // create a new user token object with both access and refresh token in table with true status flag
            const newToken = new RefToken({status: true, accessToken, refreshToken: refToken});
    
            //store the same user token object
            await newToken.save();
    
            //return user with new access and refresh token
            res.send({accessToken, refreshToken: refToken});
        } catch (error) {
            // catch and return any error occured in between
            next(error)
        }
    },
    logout: async (req, res, next) => {
        try {
            // check for refesh token in req body
            const { refreshToken } = req.body;

            // if missing refresh token then throw bad request
            if(!refreshToken) throw createError.BadRequest();
    
            // verify active status of refresh token
            const userId = await verifyRefreshToken(refreshToken);
    
            // update token object status to false since user logs out so token invalidates
            if(userId) await RefToken.findOneAndUpdate({refreshToken}, {status: false});
    
            //fetch user data from user db
            const user = await User.findOne({_id: userId});
    
            // returns logged out message with user mail id from user data fetched
            res.send({response: `${user.email} logged out`});
    
        } catch (error) {
            // return error if something fails in between
            next(error)
        }
    },
    setMPin: async (req, res, next) => {
        try {
            //validate input mpin with validate schema
            const result = await mPinSchema.validateAsync(req.body);
            
            //check if valid mpin exits previously in flow
            const doesExist = await mPin.findOne({email: result.email});

            // if pin exists then return pin exists 
            if(doesExist) throw createError.Conflict(`${result.email} is already have Pin Set`);

            // generate new mpin if not present
            const mpin = new mPin(result);

            // save new pin generated against the user db
            const saveMPin = await mpin.save();

            //return success mpin message
            res.send({response: `${saveMPin.email} pin set`});
        } catch (error) {
            // return any error if occured in between
            next(error)
        }
    }
}