// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/wechat/register'
})

const {
  RegisterValidator
} = require(`${process.cwd()}/app/validators/wechat/validators`)
const RegisterModel = require(`${process.cwd()}/app/model/wechat/register`)
const Auth = require(`${process.cwd()}/middlewares/wechat/auth`)

// 小程序用户注册登录
router.post('/', async (ctx, next) => {
  const v = await new RegisterValidator().validate(ctx)
  // 校验openId是否存在
  await RegisterModel.verifyOpenId(await v.get('body.code'))
  // 将用户信息写入数据库并返回uid和scope
  const params = {
    nickname: await v.get('body.nickName'),
    avatarUrl: await v.get('body.avatarUrl'),
    country: await v.get('body.country'),
    province: await v.get('body.province'),
    city: await v.get('body.city'),
    scope: 10
  }
  const result = await RegisterModel.insertUser(params)
  // 生成token
  const token = Auth.generateToken(result.uid, result.scope)
  // 给前端返回token
  global.success({
    data: {
      token
    }
  })
})

module.exports = router