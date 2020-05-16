// 不需要token的api路径配置，如果不配置聚会进行token验证拦截

const escapeApi = [
  // 小程序不校验路由
  {
    method: ['GET', 'POST'],
    path: '/api/wechat/test'
  },
  {
    method: ['POST'],
    path: '/api/wechat/file/upload'
  },
  {
    method: ['GET'],
    path: '/api/wechat/file/delete'
  },
  {
    method: ['POST'],
    path: '/api/wechat/login'
  },
  {
    method: ['POST'],
    path: '/api/wechat/auth'
  },
  {
    method: ['POST'],
    path: '/api/wechat/token/generate'
  },
  {
    method: ['POST'],
    path: '/api/wechat/token/verify'
  },
  {
    method: ['POST'],
    path: '/api/wechat/management/notices/list'
  },
  {
    method: ['POST'],
    path: '/api/wechat/management/notices/detail'
  },
  {
    method: ['POST'],
    path: '/api/wechat/management/images/list'
  },


  // PC端不校验内容
  {
    method: ['POST'],
    path: '/api/admin/login'
  },
  {
    method: ['POST'],
    path: '/api/admin/token/generate'
  },
  {
    method: ['POST'],
    path: '/api/admin/file/upload'
  },
  {
    method: ['GET'],
    path: '/api/admin/file/delete'
  },
  {
    method: ['POST'],
    path: '/api/admin/file/upload/full'
  }, {
    method: ['GET'],
    path: '/api/admin/file/delete/full'
  },

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