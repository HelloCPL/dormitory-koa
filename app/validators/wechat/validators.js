const {
  Rule,
  LinValidator
} = require(`${process.cwd()}/core/lin-validator`)

const {
  LoginType,
} = require(`${process.cwd()}/app/lib/enum`)

// 普通的参数校验方法 
//参数单个可为对象 {key, rules: [[type, msg, rule], [type2, msg2, rule], ...]}
//参数多个为数组 [{key, rules: [[type, msg, rule], ...]}, ...] 
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
    if (global.tools.isArray(rule.rules[0])) {
      for (let i = 0, len = rule.rules.length; i < len; i++) {
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

// 实名认证校验 必填 openId name studentNum password 选填 nickname avatarUrl
// 同时异步查询数据库 name studentNum password 是否一致
class AuthVaildator extends LinValidator {
  constructor() {
    super()
    this.openId = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    this.name = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    this.studentNum = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    this.password = [new Rule('isLength', '参数必传', {
      min: 1
    })]
  }

  // 异步查询数据库 判断 name studentNum password
  async validateParams(vals) {
    const {
      db
    } = require(`${process.cwd()}/core/db`)
    let {
      name,
      studentNum,
      password
    } = vals.body
    const sql = 'SELECT name, password FROM tb_students WHERE student_num = ?;'
    const res= await db.query(sql, studentNum)
    let data = res.data[0]
    if (data) {
      if (data.name != name) {
        throw new Error('姓名错误')
      } else if (data.password != password) {
        throw new Error('密码错误')
      }
    } else {
      throw new Error('学号不存在')
    }
  }
}

// 请求生成token校验参数 必填 openId studentId dorRoomId 查看数据库是否存在
class VerifyTokenValidator extends LinValidator {
  constructor() {
    super()
    this.openId = [new Rule('isLength', '参数必填', {
      min: 1
    })]
    this.studentId = [new Rule('isLength', '参数必填', {
      min: 1
    })]
    this.dorRoomId = [new Rule('isLength', '参数必填', {
      min: 1
    })]
  }

  // 异步查询数据库 判断 openId studentId dorRoomId 是否存在
  async validateParams(vals) {
    const {
      db
    } = require(`${process.cwd()}/core/db`)
    let {
      openId,
      studentId,
      dorRoomId
    } = vals.body
    const sql = 'SELECT open_id FROM tb_students WHERE open_id = ? and id = ? and dor_room_id = ?;'
    const res = await db.query(sql, [openId, studentId, dorRoomId])
    if(res.err) {
      throw new Error(res.err)
    }
  }
}

module.exports = {
  ParameterValidator,
  AuthVaildator,
  VerifyTokenValidator
}