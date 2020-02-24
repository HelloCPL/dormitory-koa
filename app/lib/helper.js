const {
  Success
} = require(`${process.cwd()}/core/http-exception`)

// 封装成功类
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

// 返回随机数
const returnRandomNumber = (fileName, count = 5) => {
  let randomNumber = new Date().valueOf()
  let index = fileName.lastIndexOf('.')
  if (index === -1)
    throw new global.errs.ParameterException('上传的文件格式有错误')
  let suffix = fileName.substring(index)
  let arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  for (let i = 0; i < count; i++) {
    let num = random(0, 35)
    randomNumber = arr[num] + randomNumber
  }
  return randomNumber + suffix
}

// 返回 [lower, upper]
function random(lower, upper) {
  return Math.floor(Math.random() * (upper - lower + 1)) + lower
}

module.exports = {
  success,
  returnRandomNumber
}