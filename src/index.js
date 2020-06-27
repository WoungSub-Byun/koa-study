require('dotenv').config(); //.env 파일에서 환경변수 불러오기
const Koa = require('koa');
const Router = require('koa-router');
const mongoose = require('mongoose');

const app = new Koa();
const router = new Router();
const api = require('./api');
const bodyParser = require('koa-bodyparser');

mongoose.Promise = global.Promise; //노드 자체 Promise사용 설정
//mongoDB 연결
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true
}).then(
    (res)=>{
        console.log('Successfully connected to mongodb');
    }
).catch(e =>{
    console.error(e);
});

const port = process.env.PORT || 4000;

app.use(bodyParser());

router.use('/api',api.routes());
app.use(router.routes()).use(router.allowedMethods())

app.listen(port, ()=>{
    console.log('koamongo server is listening to port:'+port);
});