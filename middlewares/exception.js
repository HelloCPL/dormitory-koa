// 捕获异常，全局处理中间件
const {
  HttpException
} = require(`${process.cwd()}/core/http-exception`)

const catchError = async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    const isHttpException = error instanceof HttpException
    const isDev = global.config.environment === 'dev'
    if (isDev && !isHttpException) throw error
    if (isHttpException) {
      ctx.body = {
        errorCode: error.errorCode,
        msg: error.msg,
        data: error.data,
        total: error.total
      }
      ctx.status = error.code
    } else {
      ctx.body = {
        errorCode: 500,
        msg: '服务器发生错误，请求后台开发人员处理',
        data: null,
        total: 0
      }
      ctx.status = 500
    }
  }
}

module.exports = catchError