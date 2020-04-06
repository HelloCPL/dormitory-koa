const mysql = require('mysql2')
const Async = require('async')

const {
  dbName,
  user,
  password,
  host,
  port,
  connectionLimit
} = global.config.database

// 新建连接池
const pool = mysql.createPool({
  host,
  user,
  password,
  database: dbName,
  port,
  connectionLimit
})

class Mysql {
  constructor() {}

  // 普通查询 data可以是单个字符串，也可以是数据
  static query(sql, data) {
    return new Promise((resolve) => {
      pool.query(sql, data, (err, results) => {
        if (err) {
          resolve({
            err: '服务器发生错误，数据库查询语句出错',
            data: null
          })
        } else {
          resolve({
            err: null,
            data: results[0]
          })
        }
      })
    })
  }

  // 事务查询 不依赖上一条查询结果 参数数组对象 [{sql, data}, ...]
  static execTrans(sqlParams) {
    return new Promise((resolve) => {
      pool.getConnection((err, connection) => {
        if (err) {
          throw new global.errs.HttpException('创建数据库连接失败')
        } else {
          // 开启事务
          connection.beginTransaction(err => {
            if (err) {
              throw new global.errs.HttpException('事务开启失败')
            } else {
              let sqlList = _handleExecTransSQLParams(connection, sqlParams)
              // 串联执行 多个异步
              Async.series(sqlList, (err, results) => {
                if (err) {
                  connection.rollback(err => {
                    connection.release()
                    throw new global.errs.HttpException('事务执行失败')
                  })
                } else {
                  connection.commit((err, res) => {
                    if (err) {
                      connection.rollback(err => {
                        connection.release()
                        throw new global.errs.HttpException('事务执行失败')
                      })
                    } else {
                      connection.release()
                      resolve({
                        err: null,
                        data: results
                      })
                    }
                  })
                }
              })
            }
          })
        }
      })
    })
  }
}

// 处理多条SQL语句
function _handleExecTransSQLParams(connection, sqlParams) {
  let arr = []
  sqlParams.forEach(item => {
    let temp = function (cb) {
      let sql = item.sql
      let data = item.data
      connection.query(sql, data, (err, results) => {
        if (err) {
          connection.rollback(() => {
            connection.release()
            throw new global.errs.HttpException('服务器发生错误，数据库查询语句出错')
          })
        } else {
          cb(null, results[0])
        }
      })
    }
    arr.push(temp)
  })
  return arr
}

module.exports = {
  db: Mysql
}