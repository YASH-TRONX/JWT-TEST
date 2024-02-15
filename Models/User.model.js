const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    }
})

const RefTokenSchema = new Schema({
    status: {
        type: Boolean,
        required: true,
    },
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    }
})

UserSchema.pre('save', async function (next) {
    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    }catch(error){
       next(error);
    }
})

UserSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw error
    }
}


const User =  mongoose.model('user', UserSchema)
const RefToken = mongoose.model('refToken', RefTokenSchema)
module.exports = {
    User,
    RefToken
}