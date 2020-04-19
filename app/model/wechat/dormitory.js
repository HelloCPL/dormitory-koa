const {
  db
} = require(`${process.cwd()}/core/db`)


class DormitoryModel {
  // 学生宿舍值班表 编辑
  static async dutyEdit(type, typeData, user) {
    // 先查看判断有没有该宿舍值班表 有 直接修改编辑 没有 插入新数据
    let sql = 'SELECT id FROM tb_dormitory_duty WHERE dor_room_id = ?;'
    let data = [user.dorRoomId]
    let res = await db.query(sql, data)
    if (res.err)
      throw new global.errs.HttpException(res.err)
    let resData = res.data[0]
    let updateTime = global.tools.getTimeValue()
    if (resData) { // 直接修改编辑
      let subSql = `UPDATE tb_dormitory_duty SET ${type} = ?, update_time = ?, release_user_id = ? WHERE dor_room_id = ?;`
      let subData = [typeData, updateTime, user.studentId, user.dorRoomId]
      let subRes = await db.query(subSql, subData)
      if (subRes.err) {
        throw new global.errs.HttpException(res.err)
      } else {
        global.success({
          data: null
        })
      }
    } else { // 插入新数据
      let subSql = `INSERT tb_dormitory_duty (dor_room_id, release_user_id, update_time, ${type}) VALUES (?, ?, ?, ?);`
      let subData = [user.dorRoomId, user.studentId, updateTime, typeData]
      let subRes = await db.query(subSql, subData)
      if (subRes.err) {
        throw new global.errs.HttpException(res.err)
      } else {
        global.success({
          data: null
        })
      }
    }
  }

  // 学生宿舍值班表 信息
  // 返回数据
  // id releaseUserId releaseUserName updateTime monday tuesday wednesday thursday friday saturday sunday
  // updateTimeStr
  static async dutyCheck(user) {
    let sql = 'SELECT t1.id, t1.release_user_id as releaseUserId, t2.name as releaseUserName, t1.update_time as updateTime, t1.monday, t1.tuesday, t1.wednesday, t1.thursday, t1.friday, t1.saturday, t1.sunday FROM tb_dormitory_duty t1 LEFT JOIN tb_students t2 ON t1.release_user_id = t2.id WHERE t1.dor_room_id = ?;'
    let data = [user.dorRoomId]
    const res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let dataList = res.data[0]
      dataList['updateTimeStr'] = global.tools.dateFormat(dataList['updateTime'], 'YYYY-MM-DD hh:mm:ss')
      global.success({
        data: dataList,
      })
    }
  }

  // 学生宿舍自定义日程表 增加
  static async scheduleAdd(params, user) {
    let updateTime = global.tools.getTimeValue()
    let remindTimeStr = global.tools.dateFormat(params.remindTime, 'YYYY-MM-DD')
    let sql = `INSERT tb_dormitory_schedule (dor_room_id, release_user_id, update_time, title, content, remind_time, remind_time_str, label) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`
    let data = [user.dorRoomId, user.studentId, updateTime, params.title, params.content, params.remindTime, remindTimeStr, params.label]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      global.success({
        data: null
      })
    }
  }

  // 学生宿舍自定义日程表 查看列表
  // 返回数据
  // id releaseUserId releaseUserName updateTime dorRoomId title content remindTime label
  // updateTimeStr remindTimeStr isDelete
  static async scheduleCheck(day, user) {
    let sql = 'SELECT t1.id, t1.release_user_id as releaseUserId, t2.name as releaseUserName, t1.update_time as updateTime, t1.dor_room_id as dorRoomId, t1.title, t1.content, t1.remind_time as remindTime, t1.label FROM tb_dormitory_schedule t1 LEFT JOIN tb_students t2 ON t1.release_user_id = t2.id WHERE t1.dor_room_id = ? and t1.remind_time_str = ?;'
    let data = [user.dorRoomId, day]
    const res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let dataList = res.data
      for (let i = 0, len = dataList.length; i < len; i++) {
        dataList[i]['updateTimeStr'] = global.tools.dateFormat(dataList[i]['updateTime'], 'YYYY-MM-DD hh:mm:ss')
        dataList[i]['remindTimeStr'] = global.tools.dateFormat(dataList[i]['remindTime'], 'YYYY-MM-DD hh:mm:ss')
        // 添加是否可删除 标记
        if (dataList[i]['releaseUserId'] == user.studentId) {
          dataList[i]['isDelete'] = 1
        } else {
          dataList[i]['isDelete'] = 0
        }
      }
      global.success({
        data: dataList
      })
    }
  }

  // 学生宿舍自定义日程表 删除
  static async scheduleDelete(id, user) {
    let sql = 'DELETE FROM tb_dormitory_schedule WHERE id = ? and release_user_id = ?;'
    let data = [id, user.studentId]
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

  // 学生宿舍自定义日程表 获取本月所有有数据的天数
  // 返回本月有数据的天数 ['YYYY-MM-DD', 'YYYY-MM-DD']
  static async scheduleMonthList(month, user) {
    let sql = 'SELECT remind_time_str as remindTimeStr FROM tb_dormitory_schedule WHERE dor_room_id = ? and remind_time_str like ? GROUP BY remind_time_str;'
    let data = [user.dorRoomId, month + '%']
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let resData = []
      if (global.tools.isArray(res.data)) {
        res.data.forEach(item => {
          if (item.remindTimeStr)
            resData.push(item.remindTimeStr)
        })
      }
      global.success({
        data: resData
      })
    }
  }

  // 评优、 违纪、 卫生检查 查看列表
  // 返回 分页数据 总数
  // id dorBuildingId dorBuildingName dorRoomId dorRoomName releaseUserId releaseUserName checkTime startTime endTime type title content scope remark 
  // checkTimeStr startTimeStr endTimeStr
  static async evaluationList(type, pageNo, pageSize, userInfo) {
    let page = (pageNo - 1) * pageSize
    let sqlList = [{
        sql: 'SELECT COUNT(id) as total FROM tb_dormitory_evaluation WHERE type = ? and dor_room_id = ?;',
        data: [type, userInfo.dorRoomId]
      },
      {
        sql: 'SELECT t1.id, t1.dor_building_id as dorBuildingId, t2.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t2.name as dorRoomName, t1.release_user_id as releaseUserId, t3.name as releaseUserName, t1.check_time as checkTime, t1.start_time as startTime, t1.end_time as endTime, t1.type, t1.title, t1.content, t1.scope, t1.remark FROM tb_dormitory_evaluation t1 LEFT JOIN tb_dormitory_rooms t2 ON t1.dor_room_id = t2.id LEFT JOIN tb_admin t3 ON t1.release_user_id = t3.id WHERE t1.type = ? and t1.dor_room_id = ? ORDER BY t1.check_time DESC, t1.id DESC LIMIT ?, ?;',
        data: [type, userInfo.dorRoomId, page, pageSize]
      }
    ]
    const res = await db.execTrans(sqlList)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let total = res.data[0][0]['total']
      let dataList = res.data[1]
      for (let i = 0, len = dataList.length; i < len; i++) {
        dataList[i]['checkTimeStr'] = global.tools.dateFormat(dataList[i]['checkTime'], 'YYYY-MM-DD')
        dataList[i]['startTimeStr'] = global.tools.dateFormat(dataList[i]['startTime'], 'YYYY-MM-DD')
        dataList[i]['endTimeStr'] = global.tools.dateFormat(dataList[i]['endTime'], 'YYYY-MM-DD')
      }
      global.success({
        data: dataList,
        total: total
      })
    }
  }

  // 宿舍投诉/建议 增加
  static async suggestionAdd(type, content, imgList, user) {
    let createTime = global.tools.getTimeValue()
    let sql = `INSERT tb_dormitory_suggestions (dor_building_id, dor_room_id, release_user_id, create_time, type, content, img_list) VALUES (?, ?, ?, ?, ?, ?, ?);`
    let data = [user.dorBuildingId, user.dorRoomId, user.id, createTime, type, content, imgList]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      global.success({
        data: null
      })
    }
  }

  // 宿舍投诉/建议 查看列表
  // 返回 分页数据 总数
  // id dorBuildingId dorBuildingName dorRoomId dorRoomName releaseUserId releaseUserName createTime type status content imgList replyTime replyUserId replyUserName replyContent remark 
  // createTimeStr replyTimeStr isDelete
  static async suggestionList(status, pageNo, pageSize, userInfo) {
    let page = (pageNo - 1) * pageSize
    let sql1 = 'SELECT COUNT(id) as total FROM tb_dormitory_suggestions WHERE dor_room_id = ?'
    let sql2 = 'SELECT t1.id, t1.dor_building_id as dorBuildingId, t2.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t2.name as dorRoomName, t1.release_user_id as releaseUserId, t3.name as releaseUserName, t1.create_time as createTime, t1.type, t1.status, t1.content, t1.img_list as imgList, t1.reply_time as replyTime, t1.reply_user_id as replyUserId, t4.name as replyUserName, t1.reply_content as replyContent,  t1.remark FROM tb_dormitory_suggestions t1 LEFT JOIN tb_dormitory_rooms t2 ON t1.dor_room_id = t2.id LEFT JOIN tb_students t3 ON t1.release_user_id = t3.id LEFT JOIN tb_admin t4 ON t1.reply_user_id = t4.id WHERE t1.dor_room_id = ?'
    let data1, data2
    if (status == 'all') {
      sql1 = sql1 + ';'
      data1 = [userInfo.dorRoomId]
      sql2 = sql2 + ' ORDER BY t1.create_time DESC, t1.id DESC LIMIT ?, ?;'
      data2 = [userInfo.dorRoomId, page, pageSize]
    } else {
      sql1 = sql1 + ' and status = ?;'
      data1 = [userInfo.dorRoomId, status]
      sql2 = sql2 + ' and t1.status = ? ORDER BY t1.create_time DESC, t1.id DESC LIMIT ?, ?;'
      data2 = [userInfo.dorRoomId, status, page, pageSize]
    }
    const res = await db.execTrans([{sql: sql1, data: data1}, {sql: sql2, data: data2}])
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let total = res.data[0][0]['total']
      let dataList = res.data[1]
      for (let i = 0, len = dataList.length; i < len; i++) {
        dataList[i]['createTimeStr'] = global.tools.dateFormat(dataList[i]['createTime'], 'YYYY-MM-DD hh:mm:ss')
        dataList[i]['replyTimeStr'] = global.tools.dateFormat(dataList[i]['replyTime'], 'YYYY-MM-DD hh:mm:ss')
        // 处理是否可以删除
        if (dataList[i]['releaseUserId'] == userInfo.studentId) {
          dataList[i]['isDelete'] = 1
        } else {
          dataList[i]['isDelete'] = 0
        }
        // 处理图片
        let imgList = global.toParse(dataList[i]['imgList'])
        if(global.tools.isArray(imgList) && imgList.length) {
          let arr = []
          imgList.forEach(item => {
            arr.push({
              shortName: item,
              fullName: global.config.imageUrl + item
            })
          })
          dataList[i]['imgList'] = arr
        }
      }
      global.success({
        data: dataList,
        total: total
      })
    }
  }

  // 宿舍投诉/建议 删除
  static async suggestionDelete(id, user) {
    let sql = 'DELETE FROM tb_dormitory_suggestions WHERE id = ? and release_user_id = ?;'
    let data = [id, user.studentId]
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

module.exports = DormitoryModel