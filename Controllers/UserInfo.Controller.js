const { User } = require('../Models/User.model');


module.exports = {
    getUserData: async (req, res, next) => {
        try {
            const userId = req.headers['user_id'];

            const user = await User.findOne({ _id: userId });

            res.send(user);
        } catch (error) {
            next(error)
        }
    },
}