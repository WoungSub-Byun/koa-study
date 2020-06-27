const Router = require('koa-router');
const auth = new Router();
const authCtrl = new require('./auth.controller.js');

auth.post('/register/local',authCtrl.localRegister);
auth.post('/login/local',authCtrl.localLogin)
auth.get('/exists/:key(email|username)/:value',authCtrl.exists);
auth.get('/logout', authCtrl.logout);

module.exports = auth;