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

// 小程序 实名认证校验 必填 openId name studentNum password 选填 nickname avatarUrl
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
    const res = await db.query(sql, studentNum)
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

// 小程序 请求生成token校验参数 必填 openId studentId dorRoomId 查看数据库是否存在
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
    if (res.err) {
      throw new Error(res.err)
    }
  }
}

// PC端登录验证 必填 username password
// 同时异步查询数据库 username password 是否一致
class loginVaildator extends LinValidator {
  constructor() {
    super()
    this.username = [new Rule('isLength', '参数必传', {
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
      username,
      password
    } = vals.body
    const sql = 'SELECT password FROM tb_admin WHERE phone = ?;'
    const res = await db.query(sql, username)
    if (res.err) {
      throw new Error('发生错误')
    } else {
      let data = res.data[0]
      if (data) {
        if (data.password != password) {
          throw new Error('密码错误')
        }
      } else {
        throw new Error('账号不存在')
      }
    }
  }
}

// PC端生成校验参数 必填 id
class adminTokenVaildator extends LinValidator {
  constructor() {
    super()
    this.id = [new Rule('isLength', '参数必传', {
      min: 1
    })]
  }

  // 异步查询数据库 判断 name studentNum password
  async validateParams(vals) {
    const {
      db
    } = require(`${process.cwd()}/core/db`)
    let {
      id
    } = vals.body
    const sql = 'SELECT * FROM tb_admin WHERE id = ?;'
    const res = await db.query(sql, id)
    if (res.err) {
      throw new Error('发生错误')
    } else {
      let data = res.data[0]
      if (!data)
        throw new Error('账号不存在')
    }
  }
}

// PC端新增宿舍房间校验参数
class adminDorRoomVaildator extends LinValidator {
  constructor(flag) {
    super()
    this.name = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    this.total = [new Rule('isInt', '参数必传', {
      min: 1
    })]
    this.dorBuildingId = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    this.dorBuildingName = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    if (flag)
      this.id = [new Rule('isLength', '参数必传', {
        min: 1
      })]
  }

  // 异步查询数据库 判断 dorBuildingId dorBuildingName
  async validateParams(vals) {
    const {
      db
    } = require(`${process.cwd()}/core/db`)
    let {
      dorBuildingId,
      dorBuildingName
    } = vals.body
    const sql = 'SELECT id FROM tb_dormitory_building WHERE id = ? and `name` = ?;'
    let data = [dorBuildingId, dorBuildingName]
    const res = await db.query(sql, data)
    if (res.err) {
      throw new Error('发生错误')
    } else {
      let data = res.data[0]
      if (!data)
        throw new Error('宿舍栋不存在')
    }
  }
}

// PC端删除宿舍栋校验参数
class adminDorBuildingDeleteVaildator extends LinValidator {
  constructor() {
    super()
    this.id = [new Rule('isLength', '参数必传', {
      min: 1
    })]
  }

  // 异步查询数据库 // 判断有无宿舍关联，有则不允许删除
  async validateParams(vals) {
    const {
      db
    } = require(`${process.cwd()}/core/db`)
    let {
      id
    } = vals.body
    const sql = 'SELECT id FROM tb_dormitory_rooms WHERE dor_building_id = ?;'
    let data = [id]
    const res = await db.query(sql, data)
    if(res.data){
      let resData = res.data[0]
      if (resData)
        throw new Error('该宿舍栋有房间关联，请取消关联后再进行删除')
    }
  }
}

// PC端删除宿舍房间校验参数
class adminDorRoomDeleteVaildator extends LinValidator {
  constructor() {
    super()
    this.id = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    this.dorBuildingId = [new Rule('isLength', '参数必传', {
      min: 1
    })]
  }

  // 异步查询数据库 判断 id dorBuildingId
  async validateParams(vals) {
    const {
      db
    } = require(`${process.cwd()}/core/db`)
    let {
      id,
      dorBuildingId
    } = vals.body
    const sql = 'SELECT id FROM tb_dormitory_rooms WHERE id = ? and dor_building_id = ?;'
    let data = [id, dorBuildingId]
    const res = await db.query(sql, data)
    if (res.err) {
      throw new Error('发生错误')
    } else {
      let resData = res.data[0]
      if (!resData)
        throw new Error('宿舍房间不存在')
    }
    // 判断有无学生关联，有则不允许删除
    let sql2 = 'SELECT id FROM tb_students WHERE dor_room_id = ?;'
    let data2 = [id]
    let res2 = await db.query(sql2, data2)
    if (res2.data) {
      let resData2 = res2.data[0]
      if (resData2)
      throw new Error('该宿舍有学生关联，请取消关联后再进行删除')
    }
  }
}

// PC端新增学生信息校验参数
class adminStudentInfoVaildator extends LinValidator {
  constructor(flag) {
    super()
    this.name = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    this.sex = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    this.school = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    this.major = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    this.studentNum = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    this.admissionTime = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    this.graduationTime = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    this.dorBuildingId = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    this.dorRoomId = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    if (flag)
      this.id = [new Rule('isLength', '参数必传', {
        min: 1
      })]
  }

  // 异步查询数据库 判断 dorBuildingId dorRoomId
  async validateParams(vals) {
    const {
      db
    } = require(`${process.cwd()}/core/db`)
    let {
      dorBuildingId,
      dorRoomId
    } = vals.body
    const sql = 'SELECT total, count FROM tb_dormitory_rooms WHERE id = ? and dor_building_id = ?;'
    let data = [dorRoomId, dorBuildingId]
    const res = await db.query(sql, data)
    if (res.err) {
      throw new Error('发生错误')
    } else {
      let data = res.data[0]
      console.log(data)
      if (!data)
        throw new Error('宿舍房间不存在')
      if (data.count >= data.total)
        throw new Error('宿舍房间已满员，不能继续添加人员了')
    }
  }
}

// PC端删除学生信息校验参数
class adminStudentInfoDeleteVaildator extends LinValidator {
  constructor() {
    super()
    this.id = [new Rule('isLength', '参数必传', {
      min: 1
    })]
    this.dorRoomId = [new Rule('isInt', '参数必传', {
      min: 1
    })]
  }

  // 异步查询数据库 判断 id dorRoomId
  async validateParams(vals) {
    const {
      db
    } = require(`${process.cwd()}/core/db`)
    let {
      id,
      dorRoomId
    } = vals.body
    const sql = 'SELECT id FROM tb_students WHERE id = ? and dor_room_id = ?;'
    let data = [id, dorRoomId]
    const res = await db.query(sql, data)
    if (res.err) {
      throw new Error('发生错误')
    } else {
      let data = res.data[0]
      if (!data)
        throw new Error('找不到该学生')
    }
  }
}



module.exports = {
  ParameterValidator,
  AuthVaildator,
  VerifyTokenValidator,
  loginVaildator,
  adminTokenVaildator,
  adminDorBuildingDeleteVaildator,
  adminDorRoomVaildator,
  adminDorRoomDeleteVaildator,
  adminStudentInfoVaildator,
  adminStudentInfoDeleteVaildator
}