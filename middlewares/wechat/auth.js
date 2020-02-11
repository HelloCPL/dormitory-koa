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

  // 作为中间件 校验token合法性并返回用户id和权限 
  get m() {
    return async (ctx, next) => {
      if (isToken(ctx.path)) {
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
        if (decode.scope < this.level) {
          errMsg = '权限不足'
          throw new global.errs.Forbidden(errMsg)
        }

        ctx.auth = {
          uid: decode.uid,
          scope: decode.scope
        }
        await next()
      } else {
        await next()
      }
    }
  }

  // 根据uid scope 生成小程序 token 并返回
  static generateToken(uid, scope) {
    const token = jwt.sign({
      uid,
      scope
    }, secretKey, {
      expiresIn
    })
    return token
  }

  // 检测token合法性
  static verifyToken(token) {
    try {
      jwt.verify(token, secretKey)
      return true
    } catch (error) {
      return false
    }
  }
}

module.exports = Auth