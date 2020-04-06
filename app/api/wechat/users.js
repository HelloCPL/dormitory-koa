/**
 *                 ---------------该路由模块包括------------------------
 * 1.登录接口  
 * 2.实名认证接口
 * 3.请求token
 * 4.校验token
 *  */

// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/api/wechat'
})

const {
  ParameterValidator,
  AuthVaildator,
  VerifyTokenValidator
} = require(`${process.cwd()}/app/validators/wechat/validators`)
const WxManager = require(`${process.cwd()}/app/services/wx`)
const UsersModel = require(`${process.cwd()}/app/model/wechat/users`)


// 登录接口 参数code
router.post('/login', async (ctx, next) => {
  // 校验并获取参数
  const v = await new ParameterValidator({
    key: 'code',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }).validate(ctx)
  let code = await v.get('body.code')
  // 获取 openId
  const openId = await WxManager.codeToOpenId(code)
  // 查询 openId 存在 返回学生信息 不存在 只返回 openId
  await UsersModel.findStudentByOpenId(openId)
})

// 实名认证接口 必填 openId name studentNum password 选填 nickname avatarUrl
router.post('/auth', async (ctx, next) => {
  // 获取参数并校验参数
  const v = await new AuthVaildator().validate(ctx)
  let params = {
    studentNum: await v.get('body.studentNum'),
    openId: await v.get('body.openId'),
    nickname: await v.get('body.nickname'),
    avatarUrl: await v.get('body.avatarUrl'),
  }
  // 查询openId 存在 返回信息 不存在 下一步
  await UsersModel.judgeStudentByOpenId(params.openId)
  // 插入openId并返回用户信息（事务 先插入 再查询返回）
  await UsersModel.authByStudentNum(params)
})

// 请求生成token 必填 openId studentId dorRoomId
router.post('/token/generate', async (ctx, next) => {
  const Auth = require(`${process.cwd()}/middlewares/wechat/auth`)
  // 获取并校验参数
  const v = await new VerifyTokenValidator().validate(ctx)
  // 生成token
  let params = {
    openId: await v.get('body.openId'),
    studentId: await v.get('body.studentId'),
    dorRoomId: await v.get('body.dorRoomId')
  }
  const token = Auth.generateToken(params)
  // 返回token
  global.success({
    data: token
  })
})

// 校验token是否合法
router.post('/token/verify', async (ctx, next) => {
  const Auth = require(`${process.cwd()}/middlewares/wechat/auth`)
  Auth.verifyToken(ctx)
})

module.exports = router