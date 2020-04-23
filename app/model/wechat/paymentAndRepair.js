const {
  db
} = require(`${process.cwd()}/core/db`)

class PaymentAndRepairModel {
  // 宿舍报修 增加
  static async repairAdd(content, imgList, user) {
    let createTime = global.tools.getTimeValue()
    let sql = `INSERT tb_dormitory_repair (dor_building_id, dor_room_id, release_user_id, create_time, content, img_list) VALUES (?, ?, ?, ?, ?, ?);`
    let data = [user.dorBuildingId, user.dorRoomId, user.id, createTime, content, imgList]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      global.success({
        data: null
      })
    }
  }

  // 宿舍报修 查看列表
  // 返回 分页数据 总数
  // id dorBuildingId dorBuildingName dorRoomId dorRoomName releaseUserId releaseUserName createTime status content imgList replyTime replyUserId replyUserName replyContent repairWorker repairTime evaluationId evaluationScope evaluationContent evaluationTime remark 
  // createTimeStr replyTimeStr repairTimeStr evaluationTimeStr isDelete
  static async repairList(status, pageNo, pageSize, userInfo) {
    let page = (pageNo - 1) * pageSize
    let sql1 = 'SELECT COUNT(id) as total FROM tb_dormitory_repair WHERE dor_room_id = ?'
    let sql2 = 'SELECT t1.id, t1.dor_building_id as dorBuildingId, t2.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t2.name as dorRoomName, t1.release_user_id as releaseUserId, t3.name as releaseUserName, t1.create_time as createTime, t1.status, t1.content, t1.img_list as imgList, t1.reply_time as replyTime, t1.reply_user_id as replyUserId, t4.name as replyUserName, t1.reply_content as replyContent, t1.repair_worker as repairWorker, t1.repair_time as repairTime, t1.evaluation_id as evaluationId, t5.scope as evaluationScope, t5.content as evaluationContent, t5.create_time as evaluationTime,  t1.remark FROM tb_dormitory_repair t1 LEFT JOIN tb_dormitory_rooms t2 ON t1.dor_room_id = t2.id LEFT JOIN tb_students t3 ON t1.release_user_id = t3.id LEFT JOIN tb_admin t4 ON t1.reply_user_id = t4.id LEFT JOIN tb_evaluation t5 ON t1.evaluation_id = t5.id and type = 1 WHERE t1.dor_room_id = ?'
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
    const res = await db.execTrans([{
      sql: sql1,
      data: data1
    }, {
      sql: sql2,
      data: data2
    }])
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let total = res.data[0][0]['total']
      let dataList = res.data[1]
      for (let i = 0, len = dataList.length; i < len; i++) {
        dataList[i]['createTimeStr'] = global.tools.dateFormat(dataList[i]['createTime'], 'YYYY-MM-DD hh:mm:ss')
        dataList[i]['replyTimeStr'] = global.tools.dateFormat(dataList[i]['replyTime'], 'YYYY-MM-DD hh:mm:ss')
        dataList[i]['repairTimeStr'] = global.tools.dateFormat(dataList[i]['repairTime'], 'YYYY-MM-DD hh:mm:ss')
        dataList[i]['evaluationTimeStr'] = global.tools.dateFormat(dataList[i]['evaluationTime'], 'YYYY-MM-DD hh:mm:ss')
        // 处理是否可以删除
        if (dataList[i]['releaseUserId'] == userInfo.studentId) {
          dataList[i]['isDelete'] = 1
        } else {
          dataList[i]['isDelete'] = 0
        }
        // 处理图片
        let imgList = global.toParse(dataList[i]['imgList'])
        if (global.tools.isArray(imgList) && imgList.length) {
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

  // 宿舍报修 删除
  static async repairDelete(id, user) {
    let sql = 'DELETE FROM tb_dormitory_repair WHERE id = ? and release_user_id = ?;'
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

  // 宿舍报修 修改评价
  static async repairEvaluate(id, evaluationId, user) {
    let sql = 'UPDATE tb_dormitory_repair SET evaluation_id = ?, status = 4  WHERE id = ? and release_user_id = ?;'
    let data = [evaluationId, id, user.studentId]
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
        throw new global.errs.HttpException('评价失败')
      }
    }
  }

  // 宿舍缴费 查看列表
  // 返回 分页数据 总数
  // id dorBuildingId dorBuildingName dorRoomId dorRoomName releaseUserId releaseUserName createTime status title content price accountName startTime endTime payTime payUserId payUserName remark 
  // createTimeStr startTimeStr endTimeStr payTimeStr
  static async paymentList(status, pageNo, pageSize, userInfo) {
    let page = (pageNo - 1) * pageSize
    let sqlList = [{
        sql: 'SELECT COUNT(id) as total, SUM(price) as moneyTotal FROM tb_dormitory_payment WHERE FIND_IN_SET(status, ?) and dor_room_id = ?;',
        data: [status, userInfo.dorRoomId]
      },
      {
        sql: 'SELECT t1.id, t1.dor_building_id as dorBuildingId, t2.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t2.name as dorRoomName, t1.release_user_id as releaseUserId, t3.name as releaseUserName, t1.create_time as createTime, t1.status, t1.title, t1.content, t1.price, t1.account_name as accountName, t1.start_time as startTime, t1.end_time as endTime, t1.pay_time as payTime, t1.pay_user_id as payUserId, t4.name as payUserName, t1.remark FROM tb_dormitory_payment t1 LEFT JOIN tb_dormitory_rooms t2 ON t1.dor_room_id = t2.id LEFT JOIN tb_admin t3 ON t1.release_user_id = t3.id LEFT JOIN tb_students t4 ON t1.pay_user_id = t4.id WHERE FIND_IN_SET(t1.status, ?) and t1.dor_room_id = ? ORDER BY t1.end_time DESC, t1.id DESC LIMIT ?, ?;',
        data: [status, userInfo.dorRoomId, page, pageSize]
      }
    ]
    const res = await db.execTrans(sqlList)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let total = res.data[0][0]['total']
      let moneyTotal = res.data[0][0]['moneyTotal']
      let dataList = res.data[1]
      for (let i = 0, len = dataList.length; i < len; i++) {
        dataList[i]['createTimeStr'] = global.tools.dateFormat(dataList[i]['createTime'], 'YYYY-MM-DD hh:mm:ss')
        dataList[i]['startTimeStr'] = global.tools.dateFormat(dataList[i]['startTime'], 'YYYY-MM-DD hh:mm:ss')
        dataList[i]['endTimeStr'] = global.tools.dateFormat(dataList[i]['endTime'], 'YYYY-MM-DD hh:mm:ss')
        dataList[i]['payTimeStr'] = global.tools.dateFormat(dataList[i]['payTime'], 'YYYY-MM-DD hh:mm:ss')
      }
      global.success({
        data: {
          money: moneyTotal,
          data: dataList
        },
        total: total
      })
    }
  }

  // 宿舍缴费 详情
  // id dorBuildingId dorBuildingName dorRoomId dorRoomName releaseUserId releaseUserName createTime status title content price accountName startTime endTime payTime payUserId payUserName remark 
  // createTimeStr startTimeStr endTimeStr payTimeStr
  static async paymentDetail(id, userInfo) {
    let sql = 'SELECT t1.id, t1.dor_building_id as dorBuildingId, t2.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t2.name as dorRoomName, t1.release_user_id as releaseUserId, t3.name as releaseUserName, t1.create_time as createTime, t1.status, t1.title, t1.content, t1.price, t1.account_name as accountName, t1.start_time as startTime, t1.end_time as endTime, t1.pay_time as payTime, t1.pay_user_id as payUserId, t4.name as payUserName, t1.remark FROM tb_dormitory_payment t1 LEFT JOIN tb_dormitory_rooms t2 ON t1.dor_room_id = t2.id LEFT JOIN tb_admin t3 ON t1.release_user_id = t3.id LEFT JOIN tb_students t4 ON t1.pay_user_id = t4.id WHERE t1.id = ? and t1.dor_room_id = ?'
    let data = [id, userInfo.dorRoomId]
    const res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let dataList = res.data[0]
      dataList['createTimeStr'] = global.tools.dateFormat(dataList['createTime'], 'YYYY-MM-DD hh:mm:ss')
      dataList['startTimeStr'] = global.tools.dateFormat(dataList['startTime'], 'YYYY-MM-DD hh:mm:ss')
      dataList['endTimeStr'] = global.tools.dateFormat(dataList['endTime'], 'YYYY-MM-DD hh:mm:ss')
      dataList['payTimeStr'] = global.tools.dateFormat(dataList['payTime'], 'YYYY-MM-DD hh:mm:ss')
      global.success({
        data: dataList,
      })
    }
  }

  // 学生个人物品 修改存放状态
  static async paymentPay(id, keyCode, userInfo) {
    let payTime = global.tools.getTimeValue()
    let sql = 'UPDATE tb_dormitory_payment SET status = 2, pay_time = ?, pay_user_id = ? WHERE id = ? and status = 1;'
    let data = [payTime, userInfo.studentId, id]
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

}

module.exports = PaymentAndRepairModel