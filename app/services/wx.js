const util = require('util')
const axios = require('axios')
const {
  generateWechatToken
} = require(`${process.cwd()}/core/utils`)
const Auth = require(`${process.cwd()}/middlewares/wechat/auth`)
const mysql = require(`${process.cwd()}/core/db`)

class WxManager {
  // 根据前端传过来的code获取openID
  static async codeToOpenId(code) {
    const {
      loginUrl,
      appId,
      appSecret
    } = global.config.wx
    // 得到凭借好的url
    const url = util.format(loginUrl, appId, appSecret, code)
    const result = await axios.get(url)
    if (result.status !== 200)
      throw new global.errs.AuthFailed('openId获取失败')
    const {
      errcode,
      errmsg
    } = result.data
    if (errcode) {
      throw new global.errs.AuthFailed(`openId获取失败:${errmsg}`)
    }
    return result.data.openid
  }
}

module.exports = WxManager