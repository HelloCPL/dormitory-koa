const {
  db
} = require(`${process.cwd()}/core/db`)

class StudentsModel {

  // ------------------------- 1.学生个人物品 --------------------------

  // 学生个人物品 新增 
  static async addProperty(nameList, userInfo) {
    let sql = 'INSERT INTO tb_students_property (student_id, dor_building_id, dor_room_id, update_time, name) VALUES(?, ?, ?, ?, ?)'
    let updateTime = global.tools.getTimeValue()
    let data = [userInfo.id, userInfo.dorBuildingId, userInfo.dorRoomId, updateTime]
    let sqlList = []
    nameList.forEach(item => {
      let obj = {
        sql: sql,
        data: [...data, item]
      }
      sqlList.push(obj)
    })
    const res = await db.execTrans(sqlList)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      global.success({
        data: null
      })
    }
  }

  // 学生个人物品 查询 
  // 返回 分页数据 总数
  // id name updateTime status remark 
  // studentId studentName nickname avatarUrl
  static async checkProperty(pageNo, pageSize, userInfo) {
    let page = (pageNo - 1) * pageSize
    let sqlList = [{
        sql: 'SELECT COUNT(id) as total FROM tb_students_property WHERE student_id = ?;',
        data: [userInfo.id]
      },
      {
        sql: 'SELECT id, name, update_time as updateTime, status, remark FROM tb_students_property WHERE student_id = ? ORDER BY update_time DESC, id DESC LIMIT ?, ?;',
        data: [userInfo.id, page, pageSize]
      }
    ]
    const res = await db.execTrans(sqlList)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let total = res.data[0][0]['total']
      let dataList = res.data[1]
      for (let i = 0, len = dataList.length; i < len; i++) {
        dataList[i]['studentId'] = userInfo.id
        dataList[i]['studentName'] = userInfo.name
        dataList[i]['nickname'] = userInfo.nickname
        dataList[i]['avatarUrl'] = userInfo.avatarUrl
        dataList[i]['updateTimeStr'] = global.tools.dateFormat(dataList[i]['updateTime'], 'YYYY-MM-DD hh:mm:ss')
      }
      global.success({
        data: dataList,
        total: total
      })
    }
  }

  // 学生个人物品 修改存放状态
  static async editProperty(status, id, studentId) {
    let updateTime = global.tools.getTimeValue()
    let sql = 'UPDATE tb_students_property SET status = ?, update_time = ? WHERE id = ? and student_id = ?;'
    let data = [status, updateTime, id, studentId]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let resData = res.data
      if (resData.affectedRows == 1) {
        global.success({
          data: null
        })
      } else {
        throw new global.errs.HttpException('修改失败')
      }
    }
  }

  // 学生个人物品 删除
  static async deleteProperty(id, studentId) {
    let sql = 'DELETE FROM tb_students_property WHERE id = ? and student_id = ?;'
    let data = [id, studentId]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let resData = res.data
      if (resData.affectedRows == 1) {
        global.success({
          data: null
        })
      } else {
        throw new global.errs.HttpException('删除失败')
      }
    }
  }

  // ------------------------- 2.学生个人事务申请 --------------------------

  // 学生个人事务申请 新增 
  static async addApply(params, userInfo) {
    let sql = 'INSERT INTO tb_students_apply (student_id, dor_building_id, dor_room_id, update_time, type, content, reason, start_time, end_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)'
    let updateTime = global.tools.getTimeValue()
    let data = [userInfo.id, userInfo.dorBuildingId, userInfo.dorRoomId, updateTime, params.type, params.content, params.reason, params.startTime, params.endTime]
    const res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      global.success({
        data: null
      })
    }
  }

  // 学生个人事务申请 查询 
  // 返回 分页数据 总数
  // id name updateTime type content reason startTime endTime replyTime replyContent replyUserId replyStatus 
  // studentId studentName nickname avatarUrl
  static async checkApply(pageNo, pageSize, userInfo) {
    let page = (pageNo - 1) * pageSize
    let sqlList = [{
        sql: 'SELECT COUNT(id) as total FROM tb_students_apply WHERE student_id = ?;',
        data: [userInfo.id]
      },
      {
        sql: 'SELECT t1.id, t1.update_time as updateTime, t1.type, t1.content, t1.reason, t1.start_time as startTime, t1.end_time as endTime, t1.reply_time as replyTime, t1.reply_content as replyContent, t1.reply_user_id as replyUserId, t1.reply_status as replyStatus, t2.name as replyUserName FROM tb_students_apply t1 LEFT JOIN tb_admin t2 ON t1.reply_user_id = t2.id WHERE t1.student_id = ? ORDER BY t1.update_time DESC, t1.id DESC LIMIT ?, ?;',
        data: [userInfo.id, page, pageSize]
      }
    ]
    const res = await db.execTrans(sqlList)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let total = res.data[0][0]['total']
      let dataList = res.data[1]
      for (let i = 0, len = dataList.length; i < len; i++) {
        dataList[i]['studentId'] = userInfo.id
        dataList[i]['studentName'] = userInfo.name
        dataList[i]['nickname'] = userInfo.nickname
        dataList[i]['avatarUrl'] = userInfo.avatarUrl
        dataList[i]['updateTimeStr'] = global.tools.dateFormat(dataList[i]['updateTime'], 'YYYY-MM-DD hh:mm:ss')
        dataList[i]['startTimeStr'] = global.tools.dateFormat(dataList[i]['startTime'], 'YYYY-MM-DD')
        dataList[i]['endTimeStr'] = global.tools.dateFormat(dataList[i]['endTime'], 'YYYY-MM-DD')
        dataList[i]['replyTimeStr'] = global.tools.dateFormat(dataList[i]['replyTime'], 'YYYY-MM-DD hh:mm:ss')
      }
      global.success({
        data: dataList,
        total: total
      })
    }
  }

  // 学生个人事务申请 删除
  static async deleteApply(id, studentId) {
    let sql = 'DELETE FROM tb_students_apply WHERE id = ? and student_id = ? and reply_status = 1;'
    let data = [id, studentId]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let resData = res.data
      if (resData.affectedRows == 1) {
        global.success({
          data: null
        })
      } else {
        throw new global.errs.HttpException('删除失败')
      }
    }
  }

  // ------------------------- 3.学生个人离返校登记 --------------------------

  // 学生个人离返校登记 新增 
  static async addStatusAtschool(params, userInfo) {
    let sql = 'INSERT INTO tb_students_status_atschool (student_id, dor_building_id, dor_room_id, update_time, start_time, end_time, remark) VALUES(?, ?, ?, ?, ?, ?, ?)'
    let updateTime = global.tools.getTimeValue()
    let data = [userInfo.id, userInfo.dorBuildingId, userInfo.dorRoomId, updateTime, params.startTime, params.endTime, params.remark]
    const res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      global.success({
        data: null
      })
    }
  }

  // 学生个人离返校登记 查询 
  // 返回 分页数据 总数
  // id updateTime startTime endTime status remark 
  // studentId studentName nickname avatarUrl
  static async checkStatusAtschool(pageNo, pageSize, userInfo) {
    let page = (pageNo - 1) * pageSize
    let sqlList = [{
        sql: 'SELECT COUNT(id) as total FROM tb_students_status_atschool WHERE student_id = ?;',
        data: [userInfo.id]
      },
      {
        sql: 'SELECT id, update_time as updateTime, start_time as startTime, end_time as endTime, status, remark FROM tb_students_status_atschool WHERE student_id = ? ORDER BY update_time DESC, id DESC LIMIT ?, ?;',
        data: [userInfo.id, page, pageSize]
      }
    ]
    const res = await db.execTrans(sqlList)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let total = res.data[0][0]['total']
      let dataList = res.data[1]
      for (let i = 0, len = dataList.length; i < len; i++) {
        dataList[i]['studentId'] = userInfo.id
        dataList[i]['studentName'] = userInfo.name
        dataList[i]['nickname'] = userInfo.nickname
        dataList[i]['avatarUrl'] = userInfo.avatarUrl
         dataList[i]['updateTimeStr'] = global.tools.dateFormat(dataList[i]['updateTime'], 'YYYY-MM-DD hh:mm:ss')
         dataList[i]['startTimeStr'] = global.tools.dateFormat(dataList[i]['startTime'], 'YYYY-MM-DD')
         dataList[i]['endTimeStr'] = global.tools.dateFormat(dataList[i]['endTime'], 'YYYY-MM-DD')
        // 修改 status 状态
        let nowTime = global.tools.getTimeValue()
        console.log(nowTime)
        if (dataList[i]['status'] == 1 || dataList[i]['status'] == 2) {
          if (nowTime < dataList[i]['startTime']) {
            dataList[i]['status'] = 1
          } else if (nowTime >= dataList[i]['startTime']) {
            dataList[i]['status'] = 2
          }
        }
      }
      global.success({
        data: dataList,
        total: total
      })
    }
  }

  // 学生个人离返校登记 修改状态
  static async editStatusAtschool(status, id, studentId) {
    let updateTime = global.tools.getTimeValue()
    let sql = 'UPDATE tb_students_status_atschool SET status = ?, update_time = ? WHERE id = ? and student_id = ? and (status = 1 or status = 2);'
    let data = [status, updateTime, id, studentId]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let resData = res.data
      if (resData.affectedRows == 1) {
        global.success({
          data: null
        })
      } else {
        throw new global.errs.HttpException('修改失败')
      }
    }
  }

  // 学生个人离返校登记 删除
  static async deleteStatusAtschool(id, studentId) {
    let sql = 'DELETE FROM tb_students_status_atschool WHERE id = ? and student_id = ?;'
    let data = [id, studentId]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let resData = res.data
      if (resData.affectedRows == 1) {
        global.success({
          data: null
        })
      } else {
        throw new global.errs.HttpException('删除失败')
      }
    }
  }

}

module.exports = StudentsModel