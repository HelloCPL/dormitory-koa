// 模拟登陆类型枚举
const LoginType = {
  USER_WECHAT: 100, // 小程序登录
  USER_ADMIN: 200, // PC端登录
  isThisType
}

function isThisType(val) {
  for(let key in this) {
    if(this[key] === val) return true
  }
  return false
}

module.exports = {
  LoginType
}