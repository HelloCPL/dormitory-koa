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

// 处理返回参数 对象 下划线命名 => 驼峰命名
const getCamelCase = (obj) => {
  let o = {}
  if(global.tools.isObject(obj)) {
    for(let key in obj) {
      let oKey = _getCamelCase(key)
      o[oKey] = obj[key]
    }
    return o
  } else {
    return obj
  }
}

// 下划线命名 => 驼峰命名 
function _getCamelCase(str) {
  var arr = str.split('_');
  return arr.map(function (item, index) {
    if (index === 0) {
      return item;
    } else {
      return item.charAt(0).toUpperCase() + item.slice(1);
    }
  }).join('');
}

// 将JSON字符串转为 对象或数组 并返回
const toParse = (param) => {
  if(param) {
    try {
      let newParam = JSON.parse(param)
      return newParam
    }catch(e) {
      return param
    }
  } else {
    return param
  }
}

// 转为JSON格式字符串 并返回
const toStringify = (param) => {
  if (param) {
    try {
      let newParam = JSON.stringify(param)
      return newParam
    } catch (e) {
      return params
    }
  } else {
    return param
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
    let num = _random(0, 35)
    randomNumber += arr[num]
  }
  return randomNumber + suffix
}

// 返回 文件名 + 随机数
const returnRandomFile = (fileName, count = 5) => {
  let randomNumber = '-' + new Date().valueOf()
  let index = fileName.lastIndexOf('.')
  if (index === -1)
    throw new global.errs.ParameterException('上传的文件格式有错误')
  let name = fileName.substring(0, index)
  let suffix = fileName.substring(index)
  let arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  for (let i = 0; i < count; i++) {
    let num = _random(0, 35)
    randomNumber += arr[num]
  }
  return name + randomNumber + suffix
}

// 返回 [lower, upper]
function _random(lower, upper) {
  return Math.floor(Math.random() * (upper - lower + 1)) + lower
}

module.exports = {
  success,
  getCamelCase,
  toParse,
  toStringify,
  returnRandomNumber,
  returnRandomFile
}