const {
  Rule,
  LinValidator
} = require(`${process.cwd()}/core/lin-validator`)

const {
  LoginType,
} = require(`${process.cwd()}/app/lib/enum`)

// 普通的参数校验方法 
//参数为数组 [{key, rules: [[type, msg, rule], [...], ...}, ...] 
// type类型看官网 https://www.npmjs.com/package/validator https://github.com/validatorjs/validator.js
class ParameterValidator extends LinValidator {
  constructor(rules) {
    super()
    if (global.tools.isObject(rules)) {
      this._setRule(rules)
    } else if (global.tools.isArray(rules)) {
      for (let i = 0, len = rules.length; i < len; i++) {
        let rule = rules[i]
        this._setRule(rule)
      }
    } else {
      throw new Error('服务器发生错误，校验规则有错误')
    }
  }

  // 设置校验
  _setRule(rule) {
    if (!global.tools.isArray(rule.rules) || global.tools.isEmptyArray(rule.rules))
      throw new Error('服务器发生错误，校验规则有错误')
    let ruleList = []
    if(global.tools.isArray(rule.rules[0])) {
      for(let i = 0, len = rule.rules.length; i < len; i++) {
        let item = rule.rules[i]
        ruleList.push(
          new Rule(item[0], item[1], item[2])
        )
      }
    } else {
      ruleList.push(
        new Rule(rule.rules[0], rule.rules[1], rule.rules[2])
      )
    }
    console.log(ruleList)
    this[rule.key] = ruleList
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
  ParameterValidator,
  RegisterValidator
}