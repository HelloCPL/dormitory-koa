const mysql = require('mysql2')

const {
  dbName,
  user,
  password,
  host,
  port
} = global.config.database

// 连接数据库
const pool = mysql.createConnection({
  host,
  user,
  password,
  database: dbName,
  port
})

class Mysql {
  // data可以是单个字符串，也可以是数据
  static query(sql, data) {
    return new Promise((resolve) => {
      pool.query(sql, data, (err, results) => {
        if (err)
          throw new global.errs.HttpException('服务器发生错误，数据库查询语句出错')
        resolve(results[0])
      })
    })
  }
}

module.exports = {
  db: Mysql
}