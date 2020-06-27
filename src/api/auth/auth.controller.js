const Joi = require('joi');
const Account = require('models/Account');

exports.localRegister = async(ctx)=>{
    //데이터 검증
    const schema = Joi.object().keys({
        username: Joi.string().alphanum().min(4).max(15).required(),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6)
    });

    const result = Joi.validate(ctx.request.body, schema);
    //스키마 검증 실패
    if(result.error){
        ctx.status = 400;
        return;
    }

    //아이디/이메일 중복확인
    let existing = null;
    try{
        existing = await Account.findByEmailOrUsername(ctx.request.body);
    }catch(e){
        ctx.throw(500,e);
    }

    if(existing){
        //중복인 경우
        ctx.status = 409;
        //email과 username중 무엇이 중복인지 알려줍니다
        ctx.body = {
            key: existing.email === ctx.request.body.email ? 'email' : 'username'
        }
        return;
    }
    let account = null;

    try{
        account = await Account.localRegister(ctx.request.body);
    } catch(e) {
        ctx.throw(500,e)
    }

    ctx.body = account.profile;
}

exports.localLogin = async(ctx)=>{
    const schema = Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const result = Joi.validate(ctx.request.body, schema);

    if(result.error){
        ctx.status = 400; //Badrequest
        return;
    }

    const {email,password} = ctx.request.body;

    let account = null;
    try{
        account= await Account.findByEmail(email);
    }catch(e){
        ctx.throw(500, e);
    }

    //User가 존재하지 않거나 passowrd가 일치하지 않을 경우
    if(!account || !account.validatePassword(password)){
        ctx.status = 403;
        return;
    }

    ctx.body = account.profile;
};

exports.exists = async(ctx)=>{
    const {key,value} = ctx.params;
    let account = null;

    try{
        account = await (key === 'email'?Account.findByEmail(value):Account.findByUsername(value));
    }catch(e){
        ctx.throw(500,e);
    }
    ctx.body = {
        exists: account !== null
    }
}

exports.logout = async (ctx)=>{
    ctx.body = 'logout';
}