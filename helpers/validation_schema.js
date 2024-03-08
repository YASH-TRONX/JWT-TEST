const Joi = require('@hapi/joi')

const registerSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(4).required(),
})

const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(4).required(),
})

const mPinSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    mPin: Joi.number().required(),
})

module.exports = {
    registerSchema,
    loginSchema,
    mPinSchema
}