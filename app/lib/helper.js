const {
  Success
} = require(`${process.cwd()}/core/http-exception`)

const success = (params) => {
  if (global.tools.isObject(params)) {
    const {
      msg,
      errorCode,
      code,
      data,
      total
    } = params
    throw new Success(msg, errorCode, code, data, total)
  } else {
    throw new Success(params)
  }
}

module.exports = {
  success
}