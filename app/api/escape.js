// 不需要token的api路径配置，如果不配置聚会进行token验证拦截

const escapeApi = [{
    method: ['GET', 'POST'],
    path: '/api/wechat/test'
  },
  {
    method: ['POST'],
    path: '/api/wechat/register'
  },
  {
    method: ['POST'],
    path: '/api/wechat/file/upload'
  }
]

// 校验是否需要拦截
const isToken = (method, path) => {
  for (let i = 0, len = escapeApi.length; i < len; i++) {
    let flag = (escapeApi[i].method.indexOf(method) != -1) && (escapeApi[i].path === path)
    if (flag) {
      return false
    }
  }
  return true
}

module.exports = isToken