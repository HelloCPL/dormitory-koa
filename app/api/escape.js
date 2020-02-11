// 不需要token的api路径配置，如果不配置聚会进行token验证拦截

const escapeApi = [
  '/wechat/register',
]

const isToken = (val) => {
  if (escapeApi.indexOf(val) === -1)
    return true
  return false
}

module.exports = isToken