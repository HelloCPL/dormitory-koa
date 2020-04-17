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
    console.log(res)
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

}

module.exports = DormitoryModel