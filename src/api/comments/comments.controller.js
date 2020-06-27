const Joi = require('joi');
const { Types: { ObjectId } } = require('mongoose');

const ObjectId = require('mongoose').Types.ObjectId

exports.replace = async (ctx) => {
    const { id } = ctx.params; // URL 파라미터에서 id 값을 읽어옵니다.

    if(!ObjectId.isValid(id)) {
        ctx.status = 400; // Bad Request
        return;
    }

    // 먼저, 검증 할 스키마를 준비해야합니다.
    const schema = Joi.object().keys({ // 객체의 field 를 검증합니다.
        // 뒤에 required() 를 붙여주면 필수 항목이라는 의미입니다
        title: Joi.string().required(),
        authors: Joi.array().items(Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().email().required() // 이런식으로 이메일도 손쉽게 검증가능합니다
        })),
        publishedDate: Joi.date().required(),
        price: Joi.number().required(),
        tags: Joi.array().items((Joi.string()).required())
    });

    // 그 다음엔, validate 를 통하여 검증을 합니다.
    const result = Joi.validate(ctx.request.body, schema); // 첫번째 파라미터는 검증할 객체이고, 두번째는 스키마입니다.

    // 스키마가 잘못됐다면
    if(result.error) {
        ctx.status = 400; // Bad Request
        ctx.body = result.error;
        return;
    }
    let book;

    try {
        // 아이디로 찾아서 업데이트를 합니다.
        // 파라미터는 (아이디, 변경 할 값, 설정) 순 입니다.
        book = await Book.findByIdAndUpdate(id, ctx.request.body, {
            upsert: true, // 이 값을 넣어주면 데이터가 존재하지 않으면 새로 만들어줍니다
            new: true // 이 값을 넣어줘야 반환하는 값이 업데이트된 데이터입니다.
                      // 이 값이 없으면 ctx.body = book 했을때 업데이트 전의 데이터를 보여줍니다.
        });
    } catch (e) {
        return ctx.throw(500, e);
    }
    ctx.body = book;
}