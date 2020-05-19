const {
  db
} = require(`${process.cwd()}/core/db`)

class DorPaymentAndRepairModel {
  // 宿舍检查 查询列表
  // 返回数据 id dorBuildingId dorBuildingName dorRoomId dorRoomName releaseUserId releaseUserName phone createTime status content imgList replyTime replyUserId replyUserName replyContent repairWorker repairTime evaluationId evaluationScope evaluationContent evaluationTime remark 
  static async repairList(params) {
    let page = (params.pageNo - 1) * params.pageSize
    if (params.keyword) {
      params.keyword = '%' + params.keyword + '%'
    } else {
      params.keyword = '\%'
    }
    let sql1 = 'SELECT COUNT(t1.id) as total FROM tb_dormitory_repair t1 LEFT JOIN tb_students t2 ON t1.release_user_id = t2.id LEFT JOIN tb_admin t3 ON t1.reply_user_id = t3.id WHERE (t1.content LIKE ? or  t1.remark LIKE ? or t2.name LIKE ? or t3.name LIKE ?)'
    let data1 = [params.keyword, params.keyword, params.keyword, params.keyword]
    let sql2 = 'SELECT t1.id, t1.dor_building_id as dorBuildingId, t4.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t4.name as dorRoomName, t1.release_user_id as releaseUserId, t2.name as releaseUserName, t2.phone, t1.create_time as createTime, t1.status, t1.content, t1.img_list as imgList, t1.reply_time as replyTime, t1.reply_user_id as replyUserId, t1.reply_user_id as replyUserId, t3.name as replyUserName, t1.reply_content as replyContent, t1.repair_worker as repairWorker, t1.repair_time as repairTime, t1.evaluation_id as evaluationId, t5.scope as evaluationScope, t5.content as evaluationContent, t5.create_time as evaluationTime, t1.remark FROM tb_dormitory_repair t1 LEFT JOIN tb_students t2 ON t1.release_user_id = t2.id LEFT JOIN tb_admin t3 ON t1.reply_user_id = t3.id LEFT JOIN tb_dormitory_rooms t4 ON t1.dor_room_id = t4.id LEFT JOIN tb_evaluation t5 ON t1.evaluation_id = t5.id WHERE (t1.content LIKE ? or  t1.remark LIKE ? or t2.name LIKE ? or t3.name LIKE ?)'
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
    if (params.status || params.status === 0) {
      sql1 += ' and t1.status = ?'
      data1.push(params.status)
      sql2 += ' and t1.status = ?'
      data2.push(params.status)
    }
    sql2 += ' ORDER BY t1.create_time DESC, t1.id DESC LIMIT ?, ?;'
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
      for (let i = 0, len = dataList.length; i < len; i++) {
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
        total
      })
    }
  }

  // 宿舍维修 编辑
  static async repairEdit(params, userInfo) {
    let nowTime = global.tools.getTimeValue()
    let sql = 'UPDATE tb_dormitory_repair SET reply_time = ?, reply_user_id = ?, status = ?, reply_content = ?, remark = ?, repair_worker = ?, repair_time = ? WHERE id = ?;'
    let data = [nowTime, userInfo.id, params.status, params.replyContent, params.remark, params.repairWorker, params.repairTime, params.id]
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

module.exports = DorPaymentAndRepairModel