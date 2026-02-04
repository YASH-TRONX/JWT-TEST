const JWT = require('jsonwebtoken');

const createError = require('http-errors');

const signAccessToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {}
        const secret = process.env.ACCESS_TOKEN_SECRET;
        const options = {
            expiresIn: '15m',
            issuer: "yashtron",
            audience: userId
        };
        JWT.sign(payload, secret, options, (err, token) => {
            if (err) {
                // reject(err)
                console.log(err.message);
                reject(createError.InternalServerError())
            }
            resolve(token)
        })
    })
};

const signRefreshToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {}
        const secret = process.env.REFRESH_TOKEN_SECRET;
        const options = {
            expiresIn: "1y",
            issuer: "yashtron",
            audience: userId
        };
        JWT.sign(payload, secret, options, (err, token) => {
            if (err) {
                // reject(err)
                console.log(err.message);
                reject(createError.InternalServerError())
            }
            resolve(token)
        })
    })
};

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken: async (req, res, next) => {
        const authToken = req.headers['authorization'];
        if (!authToken) return next(createError.Unauthorized());
        JWT.verify(authToken, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                const error = {
                    ...err,
                    message: "Invalid Token"
                };

                return next(error)
            }
            req.payload = payload
            next()
        })
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                if (err) return reject(createError.Unauthorized())

                const userId = payload.aud;

                resolve(userId);
            })
        })
    }
}