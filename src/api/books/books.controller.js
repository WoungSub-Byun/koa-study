const Book = require('models/book');
const Joi = require('joi');
const { Types: {ObjectId}} = require('mongoose');

exports.list = async (ctx) =>{
    let books;

    try{
        //.exec() -> 실제 DB에 요청
        books = await book.find()
                .sort({_id: -1}) //_id 역순으로 정렬
                .limit(3) //3개만 가져오도록
                .exec();
    } catch (e){
        return ctx.throw(500,e);
    }
    ctx.body = books;
};

exports.create = async (ctx) =>{
    const {
        title,
        authors,
        publishedDate,
        price,
        tags
    } = ctx.request.body;

    const book = new Book({
        title,
        authors,
        publishedDate,
        price,
        tags
    });

    try{
        await book.save();
    } catch(e){
        return ctx.throw(500,e);
    }

    ctx.body = book;
};

exports.delete = async(ctx) =>{
    const { id } = ctx.params;

    try{
        await Book.findByIdAndRemove(id).exec();
    } catch (e) {
        if(e.name === 'CastError'){
            ctx.status = 400;
            return;
        }
    }
    ctx.status = 204;
}

exports.replace = async (ctx) =>{

    const { id } = ctx.params;
    
    if (!ObjectId.isValid(id)){
        ctx.status = 400;
        return;
    }
    //검증할 스키마
    const schema = Joi.object().keys({
        title: Joi.string().required(),
        authors: Joi.array().items(Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().email().required()
        })),
        publishedDate: Joi.date().required(),
        price: Joi.number().required(),
        tags: Joi.array().items((Joi.string()).required())
    });

    //validate를 사용하여 검증
    const result = Joi.validate(ctx.request.body, schema);

    if(result.error){
        ctx.status = 400;
        ctx.body = result.error;
        console.log('validateError')
        return;
    }

    let book;

    try{
        book = await Book.findByIdAndUpdate(id, ctx.request.body, {
            upsert: true, //데이터가 존재하지 않을 때 새로 만들어줌
            new: true //업데이트 된 값이 반환 되도록 하는 항목 if false-> 업데이트 전 데이터 반환
        })
    } catch(e){
        console.log('SecondError')
        return ctx.throw(500, e);
    }
    ctx.body = book;
}

exports.update = async (ctx)=>{
    const { id } = ctx.params;

    if(!ObjectId.isValid(id)){
        ctx.status = 400;
        return;
    }

    let book;

    try {
        book  = await Book.findByIdAndUpdate(id, ctx.request.body, {
            new: true
        })
    } catch (error) {
        return ctx.throw(500,error)
    }

    ctx.body = book;
}

exports.get = async(ctx)=>{
    const { id } = ctx.params;

    let book;

    try{
        book = await Book.findById(id).exec();
    } catch (e){
        return ctx.throw(500, e);
    }

    if(!book){
        ctx.status = 404;
        ctx.body = { message: 'book not found' };
        return;
    }
    ctx.body = book;
}