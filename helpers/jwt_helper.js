const JWT = require('jsonwebtoken');

const createError = require('http-errors');

const {RefToken} = require('../Models/User.model');

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.ACCESS_TOKEN_SECRET;
            const options = {
                expiresIn: "1h",
                issuer: "yashtron",
                audience: userId
            };
            JWT.sign(payload, secret, options, (err, token) => {
                if(err){
                    // reject(err)
                    console.log(err.message);
                    reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    verifyAccessToken: async (req, res, next) => {
        if(!req.headers['authorization']) return next(createError.Unauthorized());
        const authHeader = req.headers['authorization']
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]
        const tokenData = await RefToken.findOne({accessToken: token});
        console.log(tokenData.status === false, tokenData.status)
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if(err || !tokenData.status) {
                const message = err?.name === 'JsonWebTokenError' || !tokenData.status ? 'Unauthorized' : err.message

                return next(createError.Unauthorized(message))
            }

            req.payload = payload
            next()
        })
    },
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.REFRESH_TOKEN_SECRET;
            const options = {
                expiresIn: "1y",
                issuer: "yashtron",
                audience: userId
            };
            JWT.sign(payload, secret, options, (err, token) => {
                if(err){
                    // reject(err)
                    console.log(err.message);
                    reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                if(err) return reject(createError.Unauthorized())

                const userId = payload.aud;

                resolve(userId);
            })
        })
    }
}