const {
  db
} = require(`${process.cwd()}/core/db`)

class ManagementModel {
  // 日常公告管理 新增
  static async noticesAdd(params, userInfo) {
    let updateTime = global.tools.getTimeValue()
    let createTime = global.tools.getTimeValue()
    let fileUrl = global.toStringify(params.fileUrl)
    let sql = 'INSERT tb_management_notices (release_user_id, update_time, create_time, start_time, end_time, is_public, is_top, sort, type, title, abstract, thumbnail, content, file_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'
    let data = [userInfo.id, updateTime, createTime, params.startTime, params.endTime, params.isPublic, params.isTop, params.sort, params.type, params.title, params.abstract, params.thumbnail, params.content, fileUrl]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      global.success({
        data: null
      })
    }
  }

  // 日常公告管理 编辑
  static async noticesEdit(params, userInfo) {
    let updateTime = global.tools.getTimeValue()
    let fileUrl = global.toStringify(params.fileUrl)
    let sql = 'UPDATE tb_management_notices SET release_user_id = ?, update_time = ?, start_time = ?, end_time = ?, is_public = ?, is_top = ?, sort = ?, type = ?, title = ?, abstract = ?, thumbnail = ?, content = ?, file_url = ? WHERE id = ?;'
    let data = [userInfo.id, updateTime, params.startTime, params.endTime, params.isPublic, params.isTop, params.sort, params.type, params.title, params.abstract, params.thumbnail, params.content, fileUrl, params.id]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      global.success({
        data: null
      })
    }
  }

  // 日常公告管理 删除
  // 返回 删除了几条数据
  static async noticesDelete(ids) {
    let sql = 'DELETE FROM tb_management_notices WHERE FIND_IN_SET(id, ?);'
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

  // 日常公告管理 查询列表
  // 返回数据 id releaseUserId releaseUserName(发布者) updateTime createTime startTime endTime isPublic isTop sort type title abstract thumbnail(缩略图) browseCount
  static async noticesList(params) {
    let page = (params.pageNo - 1) * params.pageSize
    let nowTime = global.tools.getTimeValue()
    if (params.keyword) {
      params.keyword = '%' + params.keyword + '%'
    } else {
      params.keyword = '\%'
    }
    let sql1 = 'SELECT COUNT(t1.id) as total FROM tb_management_notices t1 WHERE (t1.title LIKE ? or t1.abstract LIKE ?)'
    let data1 = [params.keyword, params.keyword]
    let sql2 = 'SELECT t1.id, t1.release_user_id as releaseUserId, t2.name as releaseUserName, t1.update_time as updateTime, t1.create_time as createTime, t1.start_time as startTime, t1.end_time as endTime, t1.is_public as isPublic, t1.is_top as isTop, t1.sort, t1.type, t1.title, t1.abstract, t1.thumbnail, t1.browse_count as browseCount FROM tb_management_notices t1 LEFT JOIN tb_admin t2 ON t1.release_user_id = t2.id WHERE (t1.title LIKE ? or t1.abstract LIKE ?)'
    let data2 = [params.keyword, params.keyword]
    if (params.timeStatus === 1) {
      sql1 += ' and t1.start_time < ? and t1.end_time > ?'
      data1.push(nowTime)
      data1.push(nowTime)
      sql2 += ' and t1.start_time < ? and t1.end_time > ?'
      data2.push(nowTime)
      data2.push(nowTime)
    } else if (params.timeStatus === 2) {
      sql1 += ' and t1.start_time >= ?'
      data1.push(nowTime)
      sql2 += ' and t1.start_time >= ?'
      data2.push(nowTime)
    } else if (params.timeStatus === 0) {
      sql1 += ' and t1.end_time <= ?'
      data1.push(nowTime)
      sql2 += ' and t1.end_time <= ?'
      data2.push(nowTime)
    }
    if (params.isPublic === 0 || params.isPublic === 1) {
      sql1 += ' and t1.is_public = ?'
      data1.push(params.isPublic)
      sql2 += ' and t1.is_public = ?'
      data2.push(params.isPublic)
    }
    if (params.isTop === 0 || params.isTop === 1) {
      sql2 += ' and t1.is_top = ?'
      data2.push(params.isTop)
      sql1 += ' and t1.is_top = ?'
      data1.push(params.isTop)
    }
    if (params.type) {
      sql1 += ' and FIND_IN_SET(t1.type, ?)'
      data1.push(params.type)
      sql2 += ' and FIND_IN_SET(t1.type, ?)'
      data2.push(params.type)
    }
    sql2 += ' ORDER BY t1.is_top DESC, t1.sort DESC, t1.update_time DESC, t1.id DESC LIMIT ?, ?;'
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
      // 处理图片 和 附件
      for (let i = 0, len = dataList.length; i < len; i++) {
        let thumbnail = dataList[i]['thumbnail']
        if (thumbnail) {
          dataList[i]['thumbnail'] = {
            shortName: thumbnail,
            fullName: global.config.imageUrl + thumbnail
          }
        }
      }
      global.success({
        data: dataList,
        total
      })
    }
  }

  // 日常公告管理 查询详情
  // 返回数据 id releaseUserId releaseUserName(发布者) updateTime createTime startTime endTime isPublic isTop sort type title abstract thumbnail(缩略图) content browseCount fileUrl(文件集合)
  static async noticesDetail(id) {
    let sql = 'SELECT t1.id, t1.release_user_id as releaseUserId, t2.name as releaseUserName, t1.update_time as updateTime, t1.create_time as createTime, t1.start_time as startTime, t1.end_time as endTime, t1.is_public as isPublic, t1.is_top as isTop, t1.sort, t1.type, t1.title, t1.abstract, t1.thumbnail, t1.browse_count as browseCount, t1.content, t1.file_url as fileUrl FROM tb_management_notices t1 LEFT JOIN tb_admin t2 ON t1.release_user_id = t2.id WHERE t1.id = ?;'
    let data = [id]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let resData = res.data[0] || null
      if (resData && global.tools.isObject(resData)) {
        let thumbnail = resData['thumbnail']
        resData.fileUrl = global.toParse(resData['fileUrl'])
        if (thumbnail) {
          resData['thumbnail'] = {
            shortName: thumbnail,
            fullName: global.config.imageUrl + thumbnail
          }
        }
        if (global.tools.isArray(resData.fileUrl) && resData.fileUrl.length) {
          for (let i = 0, len = resData.fileUrl.length; i < len; i++) {
            if (resData.fileUrl[i]['shortName']) {
              resData['fileUrl'][i]['fullName'] = global.config.fileUrl + resData.fileUrl[i]['shortName']
            }
          }
        } else {
          resData['fileUrl'] = []
        }
      }
      global.success({
        data: resData
      })
    }
  }

  // 图片管理 新增
  static async imagesAdd(params, userInfo) {
    let updateTime = global.tools.getTimeValue()
    let createTime = global.tools.getTimeValue()
    let sql = 'INSERT tb_management_images (release_user_id, update_time, create_time, start_time, end_time, is_public, is_top, sort, type, `desc`, url, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'
    let data = [userInfo.id, updateTime, createTime, params.startTime, params.endTime, params.isPublic, params.isTop, params.sort, params.type, params.desc, params.url, params.remark]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      global.success({
        data: null
      })
    }
  }

  // 图片管理 编辑
  static async imagesEdit(params, userInfo) {
    let updateTime = global.tools.getTimeValue()
    let sql = 'UPDATE tb_management_images SET release_user_id = ?, update_time = ?, start_time = ?, end_time = ?, is_public = ?, is_top = ?, sort = ?, type = ?, `desc` = ?, url = ?, remark = ? WHERE id = ?;'
    let data = [userInfo.id, updateTime, params.startTime, params.endTime, params.isPublic, params.isTop, params.sort, params.type, params.desc, params.url, params.remark, params.id]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      global.success({
        data: null
      })
    }
  }

  // 图片管理 删除
  // 返回 删除了几条数据
  static async imagesDelete(ids) {
    let sql = 'DELETE FROM tb_management_images WHERE FIND_IN_SET(id, ?);'
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

  // 图片管理 查询列表
  // 返回数据 id releaseUserId releaseUserName(发布者) updateTime createTime startTime endTime isPublic isTop sort type desc url(图片地址) remark
  static async imagesList(params) {
    let page = (params.pageNo - 1) * params.pageSize
    let nowTime = global.tools.getTimeValue()
    if (params.keyword) {
      params.keyword = '%' + params.keyword + '%'
    } else {
      params.keyword = '\%'
    }
    let sql1 = 'SELECT COUNT(t1.id) as total FROM tb_management_images t1 WHERE (t1.desc LIKE ? or t1.remark LIKE ?)'
    let data1 = [params.keyword, params.keyword]
    let sql2 = 'SELECT t1.id, t1.release_user_id as releaseUserId, t2.name as releaseUserName, t1.update_time as updateTime, t1.create_time as createTime, t1.start_time as startTime, t1.end_time as endTime, t1.is_public as isPublic, t1.is_top as isTop, t1.sort, t1.type, t1.desc, t1.url, t1.remark FROM tb_management_images t1 LEFT JOIN tb_admin t2 ON t1.release_user_id = t2.id WHERE (t1.desc LIKE ? or t1.remark LIKE ?)'
    let data2 = [params.keyword, params.keyword]
    if (params.timeStatus === 1) {
      sql1 += ' and t1.start_time < ? and t1.end_time > ?'
      data1.push(nowTime)
      data1.push(nowTime)
      sql2 += ' and t1.start_time < ? and t1.end_time > ?'
      data2.push(nowTime)
      data2.push(nowTime)
    } else if (params.timeStatus === 2) {
      sql1 += ' and t1.start_time >= ?'
      data1.push(nowTime)
      sql2 += ' and t1.start_time >= ?'
      data2.push(nowTime)
    } else if (params.timeStatus === 0) {
      sql1 += ' and t1.end_time <= ?'
      data1.push(nowTime)
      sql2 += ' and t1.end_time <= ?'
      data2.push(nowTime)
    }
    if (params.isPublic === 0 || params.isPublic === 1) {
      sql1 += ' and t1.is_public = ?'
      data1.push(params.isPublic)
      sql2 += ' and t1.is_public = ?'
      data2.push(params.isPublic)
    }
    if (params.isTop === 0 || params.isTop === 1) {
      sql2 += ' and t1.is_top = ?'
      data2.push(params.isTop)
      sql1 += ' and t1.is_top = ?'
      data1.push(params.isTop)
    }
    if (params.type) {
      sql1 += ' and FIND_IN_SET(t1.type, ?)'
      data1.push(params.type)
      sql2 += ' and FIND_IN_SET(t1.type, ?)'
      data2.push(params.type)
    }
    sql2 += ' ORDER BY t1.is_top DESC, t1.sort DESC, t1.update_time DESC, t1.id DESC LIMIT ?, ?;'
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
      console.log(dataList)
      // 处理图片
      for (let i = 0, len = dataList.length; i < len; i++) {
      
        let url = dataList[i]['url']
        if (url) {
          dataList[i]['url'] = {
            shortName: url,
            fullName: global.config.imageUrl + url
          }
        }
      }
      global.success({
        data: dataList,
        total
      })
    }
  }

  // 图片管理 查询详情
  // 返回数据 id releaseUserId releaseUserName(发布者) updateTime createTime startTime endTime isPublic isTop sort type desc url(图片地址) remark
  static async imagesDetail(id) {
    let sql = 'SELECT t1.id, t1.release_user_id as releaseUserId, t2.name as releaseUserName, t1.update_time as updateTime, t1.create_time as createTime, t1.start_time as startTime, t1.end_time as endTime, t1.is_public as isPublic, t1.is_top as isTop, t1.sort, t1.type, t1.desc, t1.url, t1.remark FROM tb_management_images t1 LEFT JOIN tb_admin t2 ON t1.release_user_id = t2.id WHERE t1.id = ?;'
    let data = [id]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let resData = res.data[0] || null
      if (resData && global.tools.isObject(resData)) {
        let url = resData['url']
        if (url) {
          resData['url'] = {
            shortName: url,
            fullName: global.config.imageUrl + url
          }
        }
      }
      global.success({
        data: resData
      })
    }
  }


}

module.exports = ManagementModel