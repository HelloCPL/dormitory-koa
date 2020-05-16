// 导入获取前端传过来的token
const basicAuth = require('basic-auth')
const jwt = require('jsonwebtoken')
// 获取小程序token配置
const {
  secretKey,
  expiresIn
} = require(`${process.cwd()}/config/config`).securityWechat
// 导入是否需要token验证
const isToken = require(`${process.cwd()}/app/api/escape`)

class Auth {
  constructor(level) {
    // 权限控制
    this.level = level || 1
    Auth.USER_WECHAT = 10 // 小程序用户默认权限为10
    Auth.USER_ADMIN = 20 // PC端管理员默认权限为20
  }

  // 作为中间件 校验token合法性并返回 openId studentId dorRoomId
  get m() {
    return async (ctx, next) => {
      if (ctx.path.startsWith('/api/wechat') && isToken(ctx.method, ctx.path)) {
        console.log(`访问接口：${ctx.method} ${ctx.path}`)
        // 获取解析后的token
        const userToken = basicAuth(ctx.req)
        let errMsg = 'token不合法'
        let decode
        if (!userToken || !userToken.name)
          throw new global.errs.Forbidden(errMsg)
        try {
          decode = jwt.verify(userToken.name, secretKey)
        } catch (error) {
          if (error.name === 'TokenExpiredError')
            errMsg = 'token令牌过期'
          throw new global.errs.Forbidden(errMsg)
        }
        ctx.auth = {
          openId: decode.openId,
          studentId: decode.studentId,
          dorRoomId: decode.dorRoomId,
        }
        await next()
      } else {
        console.log(`访问接口：${ctx.method} ${ctx.path}`)
        await next()
      }
    }
  }

  // 根据 openId studentId dorRoomId 生成小程序 token 并返回
  // 后期可直接通过 ctx.auth 获取 openId studentId dorRoomId
  static generateToken(params) {
    const token = jwt.sign({
      openId: params.openId,
      studentId: params.studentId,
      dorRoomId: params.dorRoomId
    }, secretKey, {
      expiresIn
    })
    return token
  }

  // 检测token合法性
  static verifyToken(ctx) {
    const userToken = basicAuth(ctx.req)
    console.log(userToken)
    if (!userToken || !userToken.name) {
      throw global.success({
        data: false
      })
    }
    try {
      jwt.verify(userToken.name, secretKey)
    } catch (error) {
      throw global.success({
        data: false
      })
    }
    throw global.success({
      data: true
    })
  }
}

module.exports = Auth