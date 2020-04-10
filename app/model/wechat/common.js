const {
  db
} = require(`${process.cwd()}/core/db`)

class CommonModel {
  // 获取用户信息并返回
  static async getUserInfo(auth) {
    const sql = 'SELECT * FROM tb_students WHERE id = ?'
    const data = [auth.studentId]
    const res = await db.query(sql, data)
    let resData = res.data[0]
    if (resData) {
      delete resData.password
      let obj = global.getCamelCase(resData)
      return obj
    } else {
      throw new global.errs.HttpException('服务器发生错误，找不到该用户信息')
    }
  }
}

module.exports = CommonModel