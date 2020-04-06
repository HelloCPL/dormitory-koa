const {
  db
} = require(`${process.cwd()}/core/db`)


class UsersModel {
  // 查询 openId 存在 返回学生信息 不存在 只返回 openId
  static async findStudentByOpenId(openId) {
    const sql = 'SELECT * FROM tb_students WHERE open_id = ?'
    const data = [openId]
    const res = await db.query(sql, data)
    if (res.data) {
      delete res.data.password
      let obj = global.getCamelCase(res.data)
      global.success({
        data: {
          type: 1,
          ...obj
        }
      })
    } else {
      global.success({
        data: {
          type: 0,
          openId: openId
        }
      })
    }
  }

  // 根据openId查询 存在 返回学生信息
  static async judgeStudentByOpenId(openId) {
    const sql = 'SELECT * FROM tb_students WHERE open_id = ?'
    const data = [openId]
    const res = await db.query(sql, data)
    if (res.data) {
      delete res.data.password
      let obj = global.getCamelCase(res.data)
      global.success({
        data: {
          type: 1,
          ...obj
        }
      })
    }
  }

  // 实名认证 
  // 先根据 studentNum 插入 openId nickname avatarUrl
  // 在根据 studentNum 查询 结果返回
  static async authByStudentNum(params) {
    let sqlList = [{
        sql: 'UPDATE tb_students SET open_id = ?, nickname = ?, avatar_url = ? WHERE student_num = ?;',
        data: [params.openId, params.nickname, params.avatarUrl, params.studentNum]
      },
      {
        sql: 'SELECT * FROM tb_students WHERE student_num = ?;',
        data: [params.studentNum]
      }
    ]
    const res = await db.execTrans(sqlList)
    let data = res.data[1]
    if (data && global.tools.isObject(data)) {
      delete data.password
      let obj = global.getCamelCase(data)
      global.success({
        data: {
          type: 1,
          ...obj
        }
      })
    } else {
      new global.errs.ParameterException('发生错误，请联系管理员')
    }
  }
}

module.exports = UsersModel