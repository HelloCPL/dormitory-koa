// 设置错误类
class HttpException extends Error {
  constructor(msg, errorCode, code, data, total) {
    super()
    this.msg = msg || '服务器发生错误'
    this.errorCode = errorCode || 500
    this.code = code || 200
    this.data = data
    this.total = total || 0
  }
}

// 参数异常类
class ParameterException extends HttpException {
  constructor(msg, errorCode, code, data, total) {
    super()
    this.msg = msg || '参数错误'
    this.errorCode = errorCode || 400
    this.code = code || 200
    this.data = data
    this.total = total || 0
  }
}

// 资源未找到异常
class NotFound extends HttpException {
  constructor(msg, errorCode, code, data, total) {
    super()
    this.msg = msg || '资源不存在'
    this.errorCode = errorCode || 404
    this.code = code || 200
    this.data = data
    this.total = total || 0
  }
}

// 权限不足禁止访问异常类
class Forbidden extends HttpException {
  constructor(msg, errorCode, code, data, total) {
    super()
    this.msg = msg || '权限不足'
    this.errorCode = errorCode || 403
    this.code = code || 200
    this.data = data
    this.total = total || 0
  }
}

// 授权失败异常类
class AuthFailed extends HttpException {
  constructor(msg, errorCode, code, data, total) {
    super()
    this.msg = msg || '授权失败'
    this.errorCode = errorCode || 401
    this.code = code || 200
    this.data = data
    this.total = total || 0
  }
}

// 成功类(通过抛出成功类型的异常返回数据)
class Success extends HttpException {
  constructor(msg, errorCode, code, data, total) {
    super()
    this.msg = msg || '操作成功'
    this.errorCode = errorCode || 0
    this.code = code || 201
    this.data = data
    this.total = total || 0
  }
}

module.exports = {
  HttpException,
  ParameterException,
  NotFound,
  Forbidden,
  AuthFailed,
  Success
}