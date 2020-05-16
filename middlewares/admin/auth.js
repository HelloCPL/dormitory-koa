// 导入获取前端传过来的token
const basicAuth = require('basic-auth')
const jwt = require('jsonwebtoken')
// 获取PC端token配置
const {
  secretKey,
  expiresIn
} = require(`${process.cwd()}/config/config`).securityAdmin
// 导入是否需要token验证
const isToken = require(`${process.cwd()}/app/api/escape`)

class Auth {
  // 作为中间件 校验token合法性并返回用户id和权限 
  get m() {
    return async (ctx, next) => {
      if (ctx.path.startsWith('/api/admin') && isToken(ctx.method, ctx.path)) {
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
        ctx.authAdmin = {
          id: decode.id
        }
        await next()
      } else {
        await next()
      }
    }
  }

  // 根据uid scope 生成PC端 token 并返回
  static generateToken(id) {
    const token = jwt.sign({
      id
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