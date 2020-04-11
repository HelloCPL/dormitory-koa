const {
  db
} = require(`${process.cwd()}/core/db`)

class ManagementModel {

  // 日常公告管理 查询列表
  // 返回 分页数据 总数
  // id releaseUserId releaseUserName updateTime createTime startTime endTime isTop sort type title abstract thumbnail browseCount
  // updateTimeStr createTimeStr startTimeStr endTimeStr
  static async noticesList(type, pageNo, pageSize) {
    let page = (pageNo - 1) * pageSize
    let sqlList = [{
        sql: 'SELECT COUNT(id) as total FROM tb_management_notices WHERE type = ? and is_public = 1;',
        data: [type]
      },
      {
        sql: 'SELECT t1.id, t1.release_user_id as releaseUserId, t2.name as releaseUserName, t1.update_time as updateTime, t1.create_time as createTime, t1.start_time as startTime, t1.end_time as endTime, t1.is_top as isTop, t1.sort, t1.type, t1.title, t1.abstract, t1.thumbnail, t1.browse_count as browseCount FROM tb_management_notices t1 LEFT JOIN tb_admin t2 ON t1.release_user_id = t2.id WHERE t1.type = ? and t1.is_public = 1 ORDER BY t1.is_top DESC, t1.sort DESC, update_time DESC, id DESC LIMIT ?, ?;',
        data: [type, page, pageSize]
      }
    ]
    const res = await db.execTrans(sqlList)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let total = res.data[0][0]['total']
      let dataList = res.data[1]
      for (let i = 0, len = dataList.length; i < len; i++) {
        dataList[i]['updateTimeStr'] = global.tools.dateFormat(dataList[i]['updateTime'], 'YYYY-MM-DD hh:mm:ss')
        dataList[i]['createTimeStr'] = global.tools.dateFormat(dataList[i]['createTime'], 'YYYY-MM-DD hh:mm:ss')
        dataList[i]['startTimeStr'] = global.tools.dateFormat(dataList[i]['startTime'], 'YYYY-MM-DD hh:mm:ss')
        dataList[i]['endTimeStr'] = global.tools.dateFormat(dataList[i]['endTime'], 'YYYY-MM-DD hh:mm:ss')
        if (dataList[i]['thumbnail']) {
          dataList[i]['thumbnail'] = global.config.imageUrl + dataList[i]['thumbnail']
        }
      }
      global.success({
        data: dataList,
        total: total
      })
    }
  }

  // 日常公告管理 查询详情 查询成功后同时增加一次浏览量
  // 返回数据
  // id releaseUserId releaseUserName updateTime createTime startTime endTime isTop sort type title abstract thumbnail browseCount content fileUrl
  // updateTimeStr createTimeStr startTimeStr endTimeStr
  static async noticesDetail(id) {
    let sqlList = [{
      sql: 'UPDATE tb_management_notices SET browse_count = browse_count + 1 WHERE id = ?;',
      data: [id]
    }, {
      sql: 'SELECT t1.id, t1.release_user_id as releaseUserId, t2.name as releaseUserName, t1.update_time as updateTime, t1.create_time as createTime, t1.start_time as startTime, t1.end_time as endTime, t1.is_top as isTop, t1.sort, t1.type, t1.title, t1.abstract, t1.thumbnail, t1.browse_count as browseCount, t1.content, t1.file_url as fileUrl FROM tb_management_notices t1 LEFT JOIN tb_admin t2 ON t1.release_user_id = t2.id WHERE t1.id = ?;',
      data: [id]
    }]
    const res = await db.execTrans(sqlList)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let dataList = res.data[1][0]
      dataList['updateTimeStr'] = global.tools.dateFormat(dataList['updateTime'], 'YYYY-MM-DD hh:mm:ss')
      dataList['createTimeStr'] = global.tools.dateFormat(dataList['createTime'], 'YYYY-MM-DD hh:mm:ss')
      dataList['startTimeStr'] = global.tools.dateFormat(dataList['startTime'], 'YYYY-MM-DD hh:mm:ss')
      dataList['endTimeStr'] = global.tools.dateFormat(dataList['endTime'], 'YYYY-MM-DD hh:mm:ss')
      if (dataList['thumbnail']) {
        dataList['thumbnail'] = global.config.imageUrl + dataList['thumbnail']
      }
      // 处理附件
      dataList['fileUrl'] = global.toParse(dataList['fileUrl'])
      if (global.tools.isArray(dataList['fileUrl']) && !global.tools.isEmptyArray(dataList['fileUrl'])) {
        for (let i = 0, len = dataList['fileUrl'].length; i < len; i++) {
          if (dataList['fileUrl'][i]['filePath']) {
            dataList['fileUrl'][i]['filePath'] = global.config.fileUrl + dataList['fileUrl'][i]['filePath']
             dataList['fileUrl'][i]['fileSize'] = global.tools.formatFileSize(dataList['fileUrl'][i]['fileSize'])
          }
        }
      }
      global.success({
        data: dataList,
      })
    }
  }

  // ---------------- 图片管理（ 轮播 宿舍相关信息图 广告图） --------------

  // 日常管理图片 查询列表
  // 返回 分页数据 总数
  // id releaseUserId releaseUserName updateTime createTime startTime endTime isTop sort type desc url remark
  // updateTimeStr createTimeStr startTimeStr endTimeStr
  static async imagesList(type, pageNo, pageSize) {
    let page = (pageNo - 1) * pageSize
    let sqlList = [{
        sql: 'SELECT COUNT(id) as total FROM tb_management_images WHERE type = ? and is_public = 1;',
        data: [type]
      },
      {
        sql: 'SELECT t1.id, t1.release_user_id as releaseUserId, t2.name as releaseUserName, t1.update_time as updateTime, t1.create_time as createTime, t1.start_time as startTime, t1.end_time as endTime, t1.is_top as isTop, t1.sort, t1.type, t1.desc, t1.url, t1.remark FROM tb_management_images t1 LEFT JOIN tb_admin t2 ON t1.release_user_id = t2.id WHERE t1.type = ? and t1.is_public = 1 ORDER BY t1.is_top DESC, t1.sort DESC, update_time DESC, id DESC LIMIT ?, ?;',
        data: [type, page, pageSize]
      }
    ]
    const res = await db.execTrans(sqlList)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let total = res.data[0][0]['total']
      let dataList = res.data[1]
      for (let i = 0, len = dataList.length; i < len; i++) {
        dataList[i]['updateTimeStr'] = global.tools.dateFormat(dataList[i]['updateTime'], 'YYYY-MM-DD hh:mm:ss')
        dataList[i]['createTimeStr'] = global.tools.dateFormat(dataList[i]['createTime'], 'YYYY-MM-DD hh:mm:ss')
        dataList[i]['startTimeStr'] = global.tools.dateFormat(dataList[i]['startTime'], 'YYYY-MM-DD hh:mm:ss')
        dataList[i]['endTimeStr'] = global.tools.dateFormat(dataList[i]['endTime'], 'YYYY-MM-DD hh:mm:ss')
        if (dataList[i]['url']) {
          dataList[i]['url'] = global.config.imageUrl + dataList[i]['url']
        }
      }
      global.success({
        data: dataList,
        total: total
      })
    }
  }

}

module.exports = ManagementModel