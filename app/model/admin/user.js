const {
  db
} = require(`${process.cwd()}/core/db`)

// 将JSON数组字符串转换成数组
function toArray(arr) {
  try {
    arr = JSON.parse(arr)
    if (global.tools.isArray(arr)) {
      return arr
    } else {
      return []
    }
  } catch (e) {
    return []
  }
}

class UsersModel {
  // 返回管理员信息 和 权限标识
  // id name sex phone headImg position instroduce powerList dorBuildingList
  static async findAdminInfo(username) {
    const sql = 'SELECT id, `name`, sex, phone, head_img as headImg, position, instroduce, powers as powerList, dor_building_key as dorBuildingList FROM tb_admin WHERE phone = ?'
    const data = [username]
    const res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let resData = res.data[0]
      if (resData) {
        resData.powerList = toArray(resData.powerList)
        resData.dorBuildingList = toArray(resData.dorBuildingList)
        if (resData.headImg) {
          resData.headImg = {
            shortName: resData.headImg,
            fullName: global.config.imageUrl + resData.headImg
          }
        }
        global.success({
          data: resData
        })
      } else {
        new global.errs.ParameterException('账号错误')
      }
    }
  }

  // 学生信息 增加
  static async studentInfoAdd(params) {
    let sqlList = [{
        sql: 'UPDATE tb_dormitory_rooms SET count = count + 1 WHERE id = ?;',
        data: [params.dorRoomId]
      },
      {
        sql: 'INSERT tb_students (`name`, sex, school, major, student_num, admission_time, graduation_time, dor_building_id, dor_room_id, phone, birthday, address, wechat, email, head_img) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
        data: [params.name, params.sex, params.school, params.major, params.studentNum, params.admissionTime, params.graduationTime, params.dorBuildingId, params.dorRoomId, params.phone, params.birthday, params.address, params.wechat, params.email, params.headImg]
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

  // 学生信息 编辑
  static async studentInfoEdit(params) {
    let sql = 'UPDATE tb_students SET  `name` = ?, sex = ?, school = ?, major = ?, student_num = ?, admission_time = ?, graduation_time = ?, dor_building_id = ?, dor_room_id = ?, phone = ?, birthday = ?, address = ?, wechat = ?, email = ?, head_img = ? WHERE id = ?;'
    let data = [params.name, params.sex, params.school, params.major, params.studentNum, params.admissionTime, params.graduationTime, params.dorBuildingId, params.dorRoomId, params.phone, params.birthday, params.address, params.wechat, params.email, params.headImg, params.id]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      global.success({
        data: null
      })
    }
  }

  // 学生信息 删除
  static async studentInfoDelete(id, dorRoomId) {
    let sqlList = [{
        sql: 'UPDATE tb_dormitory_rooms SET count = count - 1 WHERE id = ?;',
        data: [dorRoomId]
      },
      {
        sql: 'DELETE FROM tb_students WHERE id = ?;',
        data: [id]
      }
    ]
    // let sql = 'DELETE FROM tb_students WHERE FIND_IN_SET(id, ?);'
    let res = await db.execTrans(sqlList)
    console.log(res)
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

  // 学生信息 查看列表
  // 返回 id name sex phone birthday address wechat email headImg school major studentNum admissionTime graduationTime dorBuildingId dorBuildingName dorRoomId dorRoomName
  static async studentInfoList(keyword, dorBuildingId, dorRoomId, pageNo, pageSize) {
    let page = (pageNo - 1) * pageSize
    if (keyword) {
      keyword = '%' + keyword + '%'
    } else {
      keyword = '\%'
    }
    let sql1 = 'SELECT COUNT(id) as total FROM tb_students WHERE (`name` LIKE ? or sex LIKE ? or address LIKE ? or school LIKE ? or major LIKE ?)'
    let data1 = [keyword, keyword, keyword, keyword, keyword]
    let sql2 = 'SELECT t1.id, t1.name, t1.sex, t1.phone, t1.birthday, t1.address, t1.wechat, t1.email, t1.head_img as headImg, t1.school, t1.major, t1.student_num as studentNum, t1.admission_time as admissionTime, t1.graduation_time as graduationTime, t1.dor_building_id as dorBuildingId, t2.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t2.name as dorRoomName FROM tb_students t1 LEFT JOIN tb_dormitory_rooms t2 ON t1.dor_room_id = t2.id WHERE (t1.name LIKE ? or t1.sex LIKE ? or t1.address LIKE ? or t1.school LIKE ? or t1.major LIKE ?)'
    let data2 = [keyword, keyword, keyword, keyword, keyword]
    if (dorBuildingId) {
      sql1 = sql1 + ' and dor_building_id = ?'
      data1.push(dorBuildingId)
      sql2 = sql2 + ' and t1.dor_building_id = ?'
      data2.push(dorBuildingId)
    }
    if (dorRoomId) {
      sql1 = sql1 + ' and dor_room_id = ?'
      data1.push(dorRoomId)
      sql2 = sql2 + ' and t1.dor_room_id = ?'
      data2.push(dorRoomId)
    }
    sql2 = sql2 + ' ORDER BY t1.id DESC LIMIT ?, ?;'
    data2.push(page)
    data2.push(pageSize)
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
        let headImg = dataList[i]['headImg']
        if (headImg) {
          dataList[i]['headImg'] = {
            shortName: headImg,
            fullName: global.config.imageUrl + headImg
          }
        }
      }
      global.success({
        data: dataList,
        total
      })
    }
  }

  // 宿舍房间 查询详情
  // 返回 id name sex phone birthday address wechat email headImg school major studentNum admissionTime graduationTime dorBuildingId dorBuildingName dorRoomId dorRoomName
  static async studentInfoDetail(id) {
    let sql = 'SELECT t1.id, t1.name, t1.sex, t1.phone, t1.birthday, t1.address, t1.wechat, t1.email, t1.head_img as headImg, t1.school, t1.major, t1.student_num as studentNum, t1.admission_time as admissionTime, t1.graduation_time as graduationTime, t1.dor_building_id as dorBuildingId, t2.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t2.name as dorRoomName FROM tb_students t1 LEFT JOIN tb_dormitory_rooms t2 ON t1.dor_room_id = t2.id WHERE t1.id = ?'
    let data = [id]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let resData = res.data[0] || null
      if (resData) {
        // 处理图片
        let headImg = resData['headImg']
        if (headImg) {
          resData['headImg'] = {
            shortName: headImg,
            fullName: global.config.imageUrl + headImg
          }
        }
      }
      global.success({
        data: resData
      })
    }
  }


}


module.exports = UsersModel