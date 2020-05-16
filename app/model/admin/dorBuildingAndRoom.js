const {
  db
} = require(`${process.cwd()}/core/db`)

class DorBuildingAndRoomModel {
  // 宿舍栋 增加
  static async dorBuildingAdd(params) {
    let sql = 'INSERT tb_dormitory_building (`name`, `desc`) VALUES (?, ?);'
    let data = [params.name, params.desc]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      global.success({
        data: null
      })
    }
  }

  // 宿舍栋 编辑
  static async dorBuildingEdit(params) {
    let sql = 'UPDATE tb_dormitory_building SET `name` = ?, `desc` = ? WHERE id = ?;'
    let data = [params.name, params.desc, params.id]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      global.success({
        data: null
      })
    }
  }

  // 宿舍栋 删除
  static async dorBuildingDelete(ids) {
    let sql = 'DELETE FROM tb_dormitory_building WHERE FIND_IN_SET(id, ?);'
    let data = [ids]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      if (res.data && res.data.affectedRows) {
        global.success({
          data: null
        })
      } else {
        throw new global.errs.HttpException('找不到该条数据')
      }
    }
  }

  // 宿舍栋 查看列表
  // 返回 id name count desc
  static async dorBuildingList(keyword, pageNo, pageSize) {
    let page = (pageNo - 1) * pageSize
    if (keyword) {
      keyword = '%' + keyword + '%'
    } else {
      keyword = '\%'
    }
    let sqlList = [{
        sql: 'SELECT COUNT(id) as total FROM tb_dormitory_building WHERE `name` LIKE ? or `desc` LIKE ?;',
        data: [keyword, keyword]
      },
      {
        sql: 'SELECT * FROM tb_dormitory_building WHERE `name` LIKE ? or `desc` LIKE ? ORDER BY id DESC LIMIT ?, ?;',
        data: [keyword, keyword, page, pageSize]
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

  // 宿舍房间 增加
  static async dorRoomAdd(params) {
    let sqlList = [{
        sql: 'INSERT tb_dormitory_rooms (`name`, total, dor_building_id, dor_building_name, remark) VALUES (?, ?, ?, ?, ?);',
        data: [params.name, params.total, params.dorBuildingId, params.dorBuildingName, params.remark]
      },
      {
        sql: 'UPDATE tb_dormitory_building SET count = count + 1 WHERE id = ?;',
        data: [params.dorBuildingId]
      }
    ]
    let res = await db.execTrans(sqlList)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      global.success({
        data: null
      })
    }
  }

  // 宿舍房间 编辑
  static async dorRoomEdit(params) {
    let sql = 'UPDATE tb_dormitory_rooms SET `name` = ?, total = ?, dor_building_id = ?, dor_building_name = ?, remark = ? WHERE id = ?;'
    let data = [params.name, params.total, params.dorBuildingId, params.dorBuildingName, params.remark, params.id]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      global.success({
        data: null
      })
    }
  }

  // 宿舍房间 删除
  static async dorRoomDelete(id, dorBuildingId) {
    let sqlList = [{
        sql: 'UPDATE tb_dormitory_building SET count = count - 1 WHERE id = ?;',
        data: [dorBuildingId]
      },
      {
        sql: 'DELETE FROM tb_dormitory_rooms WHERE id = ?;',
        data: [id]
      }
    ]
    // let sql = 'DELETE FROM tb_dormitory_rooms WHERE FIND_IN_SET(id, ?);'
    let res = await db.execTrans(sqlList)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      if (res.data[1] && res.data[1].affectedRows) {
        global.success({
          data: null
        })
      } else {
        throw new global.errs.HttpException('找不到该条数据')
      }
    }
  }

  // 宿舍房间 查看列表
  // 返回 id name total count dorBuildingId dorBuildingName remark
  static async dorRoomList(keyword, dorBuildingId, pageNo, pageSize) {
    let page = (pageNo - 1) * pageSize
    if (keyword) {
      keyword = '%' + keyword + '%'
    } else {
      keyword = '\%'
    }
    let sql1 = 'SELECT COUNT(id) as total FROM tb_dormitory_rooms WHERE (`name` LIKE ? or remark LIKE ? or dor_building_name LIKE ?)'
    let data1 = [keyword, keyword, keyword]
    let sql2 = 'SELECT id, name, total, count, dor_building_id as dorBuildingId, dor_building_name as dorBuildingName, remark FROM tb_dormitory_rooms WHERE (`name` LIKE ? or remark LIKE ? or dor_building_name LIKE ?)'
    let data2 = [keyword, keyword, keyword]
    if (dorBuildingId) {
      sql1 = sql1 + ' and dor_building_id = ?;'
      data1.push(dorBuildingId)
      sql2 = sql2 + ' and dor_building_id = ? ORDER BY id DESC LIMIT ?, ?;'
      data2.push(dorBuildingId)
      data2.push(page)
      data2.push(pageSize)
    } else {
      sql2 = sql2 + ' ORDER BY id DESC LIMIT ?, ?;'
      data2.push(page)
      data2.push(pageSize)
    }
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

  // 宿舍房间 查看详情
  // 返回 id name total count dorBuildingId dorBuildingName remark
  static async dorRoomDetail(id) {
    let sql = 'SELECT id, name, total, count, dor_building_id as dorBuildingId, dor_building_name as dorBuildingName, remark FROM tb_dormitory_rooms WHERE id = ?;'
    let data = [id]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let resData = res.data[0] || null
      global.success({
        data: resData
      })
    }
  }

}

module.exports = DorBuildingAndRoomModel