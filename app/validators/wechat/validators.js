const {
  Rule,
  LinValidator
} = require(`${process.cwd()}/core/lin-validator`)

const {
  LoginType,
} = require(`${process.cwd()}/app/lib/enum`)

// 校验整数
class IntegerValidator extends LinValidator {
  constructor(key) {
    super()
    key = key || 'id'
    this[key] = [
      new Rule('isInt', `${key}必须为正整数`, {
        min: 1
      })
    ]
  }
}

// 注册验证
class RegisterValidator extends LinValidator {
  constructor() {
    super()
    this.code = [
      new Rule('isLength', '必须传递code值', {
        min: 1
      })
    ]
  }

  // 检测登录类型 vals参数为Linvalidator自动传入的参数对象
  // validateLoginType(vals) {
  //   let type = vals.body.type || vals.path.type
  //   if (!type)
  //     throw new Error('登录类型type是必传参数')
  //   type = parseInt(type)
  //   if (!LoginType.isThisType(type))
  //     throw new Error('登录类型type参数不合法')
  // }
}

module.exports = {
  IntegerValidator,
  RegisterValidator
}