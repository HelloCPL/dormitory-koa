const {
  db
} = require(`${process.cwd()}/core/db`)

class DorAffairModel {
  // 宿舍检查 新增
  static async checkAdd(params, userInfo) {
    let sql = 'INSERT tb_dormitory_evaluation (release_user_id, dor_building_id, dor_room_id, check_time, start_time, end_time, type, title, content, scope, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'
    let data = [userInfo.id, params.dorBuildingId, params.dorRoomId, params.checkTime, params.startTime, params.endTime, params.type, params.title, params.content, params.scope, params.remark]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      global.success({
        data: null
      })
    }
  }

  // 宿舍检查 删除
  // 返回 删除了几条数据
  static async checkDelete(ids) {
    let sql = 'DELETE FROM tb_dormitory_evaluation WHERE FIND_IN_SET(id, ?);'
    let data = [ids]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      if (res.data && res.data.affectedRows) {
        global.success({
          data: `删除了${res.data.affectedRows}条数据`
        })
      } else {
        throw new global.errs.HttpException('找不到数据')
      }
    }
  }

  // 宿舍检查 查询列表
  // 返回数据 id dorBuildingId dorBuildingName dorRoomId dorRoomName releaseUserId releaseUserName(发布者) checkTime startTime endTime type title content scope remark
  static async checkList(params) {
    let page = (params.pageNo - 1) * params.pageSize
    if (params.keyword) {
      params.keyword = '%' + params.keyword + '%'
    } else {
      params.keyword = '\%'
    }
    let sql1 = 'SELECT COUNT(t1.id) as total FROM tb_dormitory_evaluation t1 LEFT JOIN tb_admin t2 ON t1.release_user_id = t2.id WHERE (t1.title LIKE ? or t1.content LIKE ? or  t1.remark LIKE ? or t2.name LIKE ?)'
    let data1 = [params.keyword, params.keyword, params.keyword, params.keyword]
    let sql2 = 'SELECT t1.id, t1.dor_building_id as dorBuildingId, t3.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t3.name as dorRoomName, t1.release_user_id as releaseUserId, t2.name as releaseUserName, t1.check_time as checkTime, t1.start_time as startTime, t1.end_time as endTime, t1.type, t1.title, t1.content, t1.scope, t1.remark FROM tb_dormitory_evaluation t1 LEFT JOIN tb_admin t2 ON t1.release_user_id = t2.id LEFT JOIN tb_dormitory_rooms t3 ON t1.dor_room_id = t3.id WHERE (t1.title LIKE ? or t1.content LIKE ? or  t1.remark LIKE ? or t2.name LIKE ?)'
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
    if (params.scope) {
      sql1 += ' and t1.scope = ?'
      data1.push(params.scope)
      sql2 += ' and t1.scope = ?'
      data2.push(params.scope)
    }
    sql2 += ' ORDER BY t1.check_time DESC, t1.id DESC LIMIT ?, ?;'
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

  // 宿舍申请 查询列表
  // 返回数据 id releaseUserId releaseUserName phone dorBuildingId dorBuildingName dorRoomId dorRoomName createTime type status content reason startTime endTime replyTime replyContent replyUserId replyUserName remark
  static async applyList(params) {
    let page = (params.pageNo - 1) * params.pageSize
    if (params.keyword) {
      params.keyword = '%' + params.keyword + '%'
    } else {
      params.keyword = '\%'
    }
    let sql1 = 'SELECT COUNT(t1.id) as total FROM tb_dormitory_apply t1 LEFT JOIN tb_students t2 ON t1.release_user_id = t2.id LEFT JOIN tb_admin t3 ON t1.reply_user_id = t3.id WHERE (t1.content LIKE ? or t1.reason LIKE ? or t1.remark LIKE ? or t1.type LIKE ? or t2.name LIKE ? or t3.name LIKE ?)'
    let data1 = [params.keyword, params.keyword, params.keyword, params.keyword, params.keyword, params.keyword]
    let sql2 = 'SELECT t1.id, t1.release_user_id as releaseUserId, t2.name as releaseUserName, t2.phone, t1.dor_building_id as dorBuildingId, t4.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t4.name as dorRoomName, t1.create_time as createTime, t1.type, t1.status, t1.content, t1.reason, t1.start_time as startTime, t1.end_time as endTime, t1.reply_time as replyTime, t1.reply_content as replyContent, t1.reply_user_id as replyUserId, t3.name as replyUserName, t1.remark FROM tb_dormitory_apply t1 LEFT JOIN tb_students t2 ON t1.release_user_id = t2.id LEFT JOIN tb_admin t3 ON t1.reply_user_id = t3.id LEFT JOIN tb_dormitory_rooms t4 ON t1.dor_room_id = t4.id WHERE (t1.content LIKE ? or t1.reason LIKE ? or t1.remark LIKE ? or t1.type LIKE ? or t2.name LIKE ? or t3.name LIKE ?)'
    let data2 = [params.keyword, params.keyword, params.keyword, params.keyword, params.keyword, params.keyword]
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
      global.success({
        data: dataList,
        total
      })
    }
  }

  // 宿舍申请 编辑
  static async applyEdit(params, userInfo) {
    let nowTime = global.tools.getTimeValue()
    let sql = 'UPDATE tb_dormitory_apply SET reply_time = ?, reply_user_id = ?, status = ?, reply_content = ?, remark = ? WHERE id = ?;'
    let data = [nowTime, userInfo.id, params.status, params.replyContent, params.remark, params.id]
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

  // 宿舍投诉或建议 查询列表
  // 返回数据 id releaseUserId releaseUserName phone dorBuildingId dorBuildingName dorRoomId dorRoomName createTime type status content imgList(图片数组) replyTime replyContent replyUserId replyUserName remark
  static async suggestionList(params) {
    let page = (params.pageNo - 1) * params.pageSize
    if (params.keyword) {
      params.keyword = '%' + params.keyword + '%'
    } else {
      params.keyword = '\%'
    }
    let sql1 = 'SELECT COUNT(t1.id) as total FROM tb_dormitory_suggestions t1 LEFT JOIN tb_students t2 ON t1.release_user_id = t2.id LEFT JOIN tb_admin t3 ON t1.reply_user_id = t3.id WHERE (t1.content LIKE ? or t1.remark LIKE ? or t2.name LIKE ? or t3.name LIKE ?)'
    let data1 = [params.keyword, params.keyword, params.keyword, params.keyword]
    let sql2 = 'SELECT t1.id, t1.release_user_id as releaseUserId, t2.name as releaseUserName, t2.phone, t1.dor_building_id as dorBuildingId, t4.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t4.name as dorRoomName, t1.create_time as createTime, t1.type, t1.status, t1.content, t1.img_list as imgList, t1.reply_time as replyTime, t1.reply_content as replyContent, t1.reply_user_id as replyUserId, t3.name as replyUserName, t1.remark FROM tb_dormitory_suggestions t1 LEFT JOIN tb_students t2 ON t1.release_user_id = t2.id LEFT JOIN tb_admin t3 ON t1.reply_user_id = t3.id LEFT JOIN tb_dormitory_rooms t4 ON t1.dor_room_id = t4.id WHERE (t1.content LIKE ?  or t1.remark LIKE ? or t2.name LIKE ? or t3.name LIKE ?)'
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
      sql1 += ' and t1.type = ?'
      data1.push(params.type)
      sql2 += ' and t1.type = ?'
      data2.push(params.type)
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

  // 宿舍投诉或建议 查询详情
  // 返回数据 id releaseUserId releaseUserName phone dorBuildingId dorBuildingName dorRoomId dorRoomName createTime type status content imgList(图片数组) replyTime replyContent replyUserId replyUserName remark
  static async suggestionDetail(id) {
    let sql = 'SELECT t1.id, t1.release_user_id as releaseUserId, t2.name as releaseUserName, t2.phone, t1.dor_building_id as dorBuildingId, t4.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t4.name as dorRoomName, t1.create_time as createTime, t1.type, t1.status, t1.content, t1.img_list as imgList, t1.reply_time as replyTime, t1.reply_content as replyContent, t1.reply_user_id as replyUserId, t3.name as replyUserName, t1.remark FROM tb_dormitory_suggestions t1 LEFT JOIN tb_students t2 ON t1.release_user_id = t2.id LEFT JOIN tb_admin t3 ON t1.reply_user_id = t3.id LEFT JOIN tb_dormitory_rooms t4 ON t1.dor_room_id = t4.id WHERE t1.id = ?;'
    let data = [id]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let dataList = res.data[0]
      // 处理图片
      let imgList = global.toParse(dataList['imgList'])
      if (global.tools.isArray(imgList) && imgList.length) {
        let arr = []
        imgList.forEach(item => {
          arr.push({
            shortName: item,
            fullName: global.config.imageUrl + item
          })
        })
        dataList['imgList'] = arr
      }
      global.success({
        data: dataList
      })
    }
  }

  // 宿舍投诉或建议 编辑
  static async suggestionEdit(params, userInfo) {
    let nowTime = global.tools.getTimeValue()
    let sql = 'UPDATE tb_dormitory_suggestions SET reply_time = ?, reply_user_id = ?, status = ?, reply_content = ?, remark = ? WHERE id = ?;'
    let data = [nowTime, userInfo.id, params.status, params.replyContent, params.remark, params.id]
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

module.exports = DorAffairModel