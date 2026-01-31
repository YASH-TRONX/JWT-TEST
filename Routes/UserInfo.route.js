const express = require('express');
const router = express.Router();

const UserInfoController = require('../Controllers/UserInfo.Controller');

const AuthController = require('../Controllers/Auth.Controller');

router.post('/getUserData', UserInfoController.getUserData);

router.post('/logout', AuthController.logout);

module.exports = router