const {
  db
} = require(`${process.cwd()}/core/db`)

class ManagementModel {
  // 学生离返校 查询列表
  // 返回数据 id studentId studentName phone dorBuildingId dorBuildingName dorRoomId dorRoomName updateTime startTime endTime status remark
  static async statusAtschool(params) {
    let page = (params.pageNo - 1) * params.pageSize
    let nowTime = global.tools.getTimeValue()
    if (params.keyword) {
      params.keyword = '%' + params.keyword + '%'
    } else {
      params.keyword = '\%'
    }
    let sql1 = 'SELECT COUNT(t1.id) as total FROM tb_students_status_atschool t1 LEFT JOIN tb_students t2 ON t1.student_id = t2.id WHERE (t1.remark LIKE ? or t2.name LIKE ?)'
    let data1 = [params.keyword, params.keyword]
    let sql2 = 'SELECT t1.id, t1.student_id as studentId, t2.name as studentName, t2.phone, t1.dor_building_id as dorBuildingId, t3.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t3.name as dorRoomName, t1.update_time as updateTime, t1.start_time as startTime, t1.end_time as endTime, t1.status, t1.remark FROM tb_students_status_atschool t1 LEFT JOIN tb_students t2 ON t1.student_id = t2.id LEFT JOIN tb_dormitory_rooms t3 ON t1.dor_room_id = t3.id WHERE (t1.remark LIKE ? or t2.name LIKE ?)'
    let data2 = [params.keyword, params.keyword]
    if (params.dorBuildingId) {
      sql1 += ' and t1.dor_building_id = ?'
      data1.push(params.dorBuildingId)
      sql2 += ' and t1.dor_building_id = ?'
      data2.push(params.dorBuildingId)
    }
    if (params.dorRoomId) {
      sql1 += ' and t1.dor_room_id = ?'
      data1.push(params.dorRoomId)
      sql2 += ' and t1.dor_room_id = ?'
      data2.push(params.dorRoomId)
    }
    if (params.timeStatus === 3) {
      sql1 += ' and ((t1.status = 1 and t1.end_time <= ?) or (t1.status = 2 and t1.end_time <= ?))'
      data1.push(nowTime)
      data1.push(nowTime)
      sql2 += ' and ((t1.status = 1 and t1.end_time <= ?) or (t1.status = 2 and t1.end_time <= ?))'
      data2.push(nowTime)
      data2.push(nowTime)
    } else if (params.timeStatus === 2) {
      sql1 += ' and ((t1.status = 1 and t1.start_time < ? and t1.end_time > ?) or (t1.status = 2 and t1.start_time < ? and t1.end_time > ?))'
      data1.push(nowTime)
      data1.push(nowTime)
      data1.push(nowTime)
      data1.push(nowTime)
      sql2 += ' and ((t1.status = 1 and t1.start_time < ? and t1.end_time > ?) or (t1.status = 2 and t1.start_time < ? and t1.end_time > ?))'
      data2.push(nowTime)
      data2.push(nowTime)
      data2.push(nowTime)
      data2.push(nowTime)
    } else if (params.timeStatus === 1) {
      sql1 += ' and t1.start_time >= ? and (t1.status = 1 or t1.status = 2)'
      data1.push(nowTime)
      sql2 += ' and t1.start_time >= ? and (t1.status = 1 or t1.status = 2)'
      data2.push(nowTime)
    } else if (params.timeStatus === 0) {
      sql1 += ' and t1.status = 0'
      sql2 += ' and t1.status = 0'
    }
    sql2 += ' ORDER BY t1.update_time DESC, t1.id DESC LIMIT ?, ?;'
    data2.push(page)
    data2.push(params.pageSize)
    let sqlList = [{
        sql: sql1,
        data: data1
      },
      {
        sql: sql2,
        data: data2
      }
    ]
    let res = await db.execTrans(sqlList)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let total = res.data[0][0]['total']
      let dataList = res.data[1]
      // status 为 0 已返校 1 （未开始 离校中 未确认）2 （离校中 未确认）
      // 处理状态
      for (let i = 0, len = dataList.length; i < len; i++) {
        let status = dataList[i]['status']
        let startTime = dataList[i]['startTime']
        let endTime = dataList[i]['endTime']
        if (status == 0) {
          dataList[i]['statusWord'] = '已返校'
        } else if (status == 1) {
          if (nowTime <= startTime) {
            dataList[i]['statusWord'] = '未开始'
          } else if (nowTime > startTime && nowTime < endTime) {
            dataList[i]['statusWord'] = '离校中'
          } else if (nowTime >= endTime) {
            dataList[i]['statusWord'] = '未确认'
          }
        } else if (status == 2) {
          if (nowTime > startTime && nowTime < endTime) {
            dataList[i]['statusWord'] = '离校中'
          } else if (nowTime >= endTime) {
            dataList[i]['statusWord'] = '未确认'
          }
        }
      }
      global.success({
        data: dataList,
        total
      })
    }
  }

  // 学生个人物品 查询列表
  // 返回数据 id name studentId studentName phone dorBuildingId dorBuildingName dorRoomId dorRoomName updateTime status remark
  static async propertyList(params) {
    let page = (params.pageNo - 1) * params.pageSize
    // let nowTime = global.tools.getTimeValue()
    if (params.keyword) {
      params.keyword = '%' + params.keyword + '%'
    } else {
      params.keyword = '\%'
    }
    let sql1 = 'SELECT COUNT(t1.id) as total FROM tb_students_property t1 LEFT JOIN tb_students t2 ON t1.student_id = t2.id WHERE (t1.remark LIKE ? or t1.name LIKE ? or t2.name LIKE ?)'
    let data1 = [params.keyword, params.keyword, params.keyword]
    let sql2 = 'SELECT t1.id, t1.name, t1.student_id as studentId, t2.name as studentName, t2.phone, t1.dor_building_id as dorBuildingId, t3.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t3.name as dorRoomName, t1.update_time as updateTime, t1.status, t1.remark FROM tb_students_property t1 LEFT JOIN tb_students t2 ON t1.student_id = t2.id LEFT JOIN tb_dormitory_rooms t3 ON t1.dor_room_id = t3.id WHERE (t1.remark LIKE ? or t1.name LIKE ? or t2.name LIKE ?)'
    let data2 = [params.keyword, params.keyword, params.keyword]
    if (params.dorBuildingId) {
      sql1 += ' and t1.dor_building_id = ?'
      data1.push(params.dorBuildingId)
      sql2 += ' and t1.dor_building_id = ?'
      data2.push(params.dorBuildingId)
    }
    if (params.dorRoomId) {
      sql1 += ' and t1.dor_room_id = ?'
      data1.push(params.dorRoomId)
      sql2 += ' and t1.dor_room_id = ?'
      data2.push(params.dorRoomId)
    }
    if (params.status || params.status === 0) {
      sql1 += ' and t1.status = ?'
      data1.push(params.status)
      sql2 += ' and t1.status = ?'
      data2.push(params.status)
    }
    sql2 += ' ORDER BY t1.update_time DESC, t1.id DESC LIMIT ?, ?;'
    data2.push(page)
    data2.push(params.pageSize)
    let sqlList = [{
        sql: sql1,
        data: data1
      },
      {
        sql: sql2,
        data: data2
      }
    ]
    let res = await db.execTrans(sqlList)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let total = res.data[0][0]['total']
      let dataList = res.data[1]
      global.success({
        data: dataList,
        total
      })
    }
  }

  // 学生个人物品 编辑
  static async propertyEdit(id, status) {
    let sql = 'UPDATE tb_students_property SET status = ? WHERE id = ?;'
    let data = [status, id]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      if (res.data && res.data.affectedRows) {
        global.success({
          data: null
        })
      } else {
        throw new global.errs.HttpException('找不到数据')
      }
    }
  }

  // 学生个人事务申请 查询列表
  // 返回数据 id studentId studentName phone dorBuildingId dorBuildingName dorRoomId dorRoomName updateTime type content reason startTime endTime replyTime replyContent replyUserId replyUserName replyStatus
  static async applyList(params) {
    let page = (params.pageNo - 1) * params.pageSize
    if (params.keyword) {
      params.keyword = '%' + params.keyword + '%'
    } else {
      params.keyword = '\%'
    }
    let sql1 = 'SELECT COUNT(t1.id) as total FROM tb_students_apply t1 LEFT JOIN tb_students t2 ON t1.student_id = t2.id LEFT JOIN tb_admin t3 ON t1.reply_user_id = t3.id WHERE (t1.content LIKE ? or t1.reason LIKE ? or t2.name LIKE ? or t3.name LIKE ?)'
    let data1 = [params.keyword, params.keyword, params.keyword, params.keyword]
    let sql2 = 'SELECT t1.id, t1.student_id as studentId, t2.name as studentName, t2.phone, t1.dor_building_id as dorBuildingId, t4.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t4.name as dorRoomName, t1.update_time as updateTime, t1.type, t1.content, t1.reason, t1.start_time as startTime, t1.end_time as endTime, t1.reply_time as replyTime, t1.reply_content as replyContent, t1.reply_user_id as replyUserId, t3.name as replyUserName, t1.reply_status as replyStatus FROM tb_students_apply t1 LEFT JOIN tb_students t2 ON t1.student_id = t2.id LEFT JOIN tb_admin t3 ON t1.reply_user_id = t3.id LEFT JOIN tb_dormitory_rooms t4 ON t1.dor_room_id = t4.id WHERE (t1.content LIKE ? or t1.reason LIKE ? or t2.name LIKE ? or t3.name LIKE ?)'
    let data2 = [params.keyword, params.keyword, params.keyword, params.keyword]
    if (params.dorBuildingId) {
      sql1 += ' and t1.dor_building_id = ?'
      data1.push(params.dorBuildingId)
      sql2 += ' and t1.dor_building_id = ?'
      data2.push(params.dorBuildingId)
    }
    if (params.dorRoomId) {
      sql1 += ' and t1.dor_room_id = ?'
      data1.push(params.dorRoomId)
      sql2 += ' and t1.dor_room_id = ?'
      data2.push(params.dorRoomId)
    }
    if (params.type) {
      sql1 += ' and FIND_IN_SET(t1.type, ?)'
      data1.push(params.type)
      sql2 += ' and FIND_IN_SET(t1.type, ?)'
      data2.push(params.type)
    }
    if (params.replyStatus || params.replyStatus === 0) {
      sql1 += ' and t1.reply_status = ?'
      data1.push(params.replyStatus)
      sql2 += ' and t1.reply_status = ?'
      data2.push(params.replyStatus)
    }
    sql2 += ' ORDER BY t1.update_time DESC, t1.id DESC LIMIT ?, ?;'
    data2.push(page)
    data2.push(params.pageSize)
    let sqlList = [{
        sql: sql1,
        data: data1
      },
      {
        sql: sql2,
        data: data2
      }
    ]
    let res = await db.execTrans(sqlList)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let total = res.data[0][0]['total']
      let dataList = res.data[1]
      global.success({
        data: dataList,
        total
      })
    }
  }

  // 学生个人事务申请 编辑
  static async applyEdit(params, userInfo) {
    let nowTime = global.tools.getTimeValue()
    let sql = 'UPDATE tb_students_apply SET reply_time = ?, reply_user_id = ?, reply_status = ?, reply_content = ? WHERE id = ?;'
    let data = [nowTime, userInfo.id, params.replyStatus, params.replyContent, params.id]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      if (res.data && res.data.affectedRows) {
        global.success({
          data: null
        })
      } else {
        throw new global.errs.HttpException('找不到数据')
      }
    }
  }

}

module.exports = ManagementModel