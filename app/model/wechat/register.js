const {
  db
} = require(`${process.cwd()}/core/db`)
const WxManager = require(`${process.cwd()}/app/services/wx`)
const Auth = require(`${process.cwd()}/middlewares/wechat/auth`)

class RegisterModel {
  // 插入用户数据并返回id
  static async insertUser({
    nickname,
    avatarUrl,
    country,
    province,
    city,
    scope = 10
  }) {
    const sql = 'CALL addUserAndReturnId(?, ?, ?, ?, ?, ?, ?);'
    const data = [nickname, avatarUrl, country, province, city, this.openId, scope]
    const result = await db.query(sql, data)
    return {
      uid: result[0]['LAST_INSERT_ID()'],
      scope: 10 // 小程序用户权限默认 10
    }
  }

  // 查询是否已经存在openID，如果存在则返回token和用户信息
  static async verifyOpenId(code) {
    const openId = await WxManager.codeToOpenId(code)
    const sql = 'SELECT * FROM wechat_users WHERE open_id = ?;'
    const result = await db.query(sql, openId)
    if (result) {
      const token = Auth.generateToken(result.id, result.scope)
      global.success({
        data: {
          token
        },
        msg: '该openId已存在'
      })
    }
    this.openId = openId
  }
}

module.exports = RegisterModel