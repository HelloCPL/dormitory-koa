const {
  db
} = require(`${process.cwd()}/core/db`)


class UsersModel {
  // 查询 openId 存在 返回学生信息 不存在 只返回 openId
  static async findStudentByOpenId(openId) {
    const sql = 'SELECT * FROM tb_students WHERE open_id = ?'
    const data = [openId]
    const res = await db.query(sql, data)
    let resData = res.data[0]
    if (resData) {
      delete resData.password
      let obj = global.getCamelCase(resData)
      global.success({
        data: {
          type: 1,
          ...obj
        }
      })
    } else {
      global.success({
        data: {
          type: 0,
          openId: openId
        }
      })
    }
  }

  // 根据openId查询 存在 返回学生信息
  static async judgeStudentByOpenId(openId) {
    const sql = 'SELECT * FROM tb_students WHERE open_id = ?'
    const data = [openId]
    const res = await db.query(sql, data)
    let resData = res.data[0]
    if (resData) {
      delete resData.password
      let obj = global.getCamelCase(resData)
      global.success({
        data: {
          type: 1,
          ...obj
        }
      })
    }
  }

  // 实名认证 
  // 先根据 studentNum 插入 openId nickname avatarUrl
  // 在根据 studentNum 查询 结果返回
  static async authByStudentNum(params) {
    let sqlList = [{
        sql: 'UPDATE tb_students SET open_id = ?, nickname = ?, avatar_url = ? WHERE student_num = ?;',
        data: [params.openId, params.nickname, params.avatarUrl, params.studentNum]
      },
      {
        sql: 'SELECT * FROM tb_students WHERE student_num = ?;',
        data: [params.studentNum]
      }
    ]
    const res = await db.execTrans(sqlList)
    let data = res.data[1][0]
    if (data && global.tools.isObject(data)) {
      delete data.password
      let obj = global.getCamelCase(data)
      global.success({
        data: {
          type: 1,
          ...obj
        }
      })
    } else {
      new global.errs.ParameterException('发生错误，请联系管理员')
    }
  }

  // 宿舍成员信息(本宿舍) 列表
  // 返回
  // dorBuildingName dorRoomName
  // id name sex phone headImg nickname avatarUrl
  static async menberList(userInfo) {
    let sql = 'SELECT id, name, sex, phone, head_img as headImg, nickname, avatar_url as avatarUrl FROM tb_students WHERE dor_room_id = ?;'
    let data = [userInfo.dorRoomId]
    let res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      if (global.tools.isArray(res.data)) {
        for (let i = 0, len = res.data.length; i < len; i++) {
          if (res.data[i]['headImg']) {
            res.data[i]['headImg'] = {
              shortName: res.data[i]['headImg'],
              fullName: global.config.imageUrl + res.data[i]['headImg']
            }
          }
        }
      }
      global.success({
        data: {
          dorBuildingName: userInfo.dorBuildingName,
          dorRoomName: userInfo.dorRoomName,
          members: res.data
        }
      })
    }
  }

  // 宿舍成员信息(本宿舍) 详情
  // 返回
  // id name sex phone address wechat email headImg school major studentNum admissionTime graduationTime dorBuildingId dorBuildingName dorRoomId dorRoomName nickname avatarUrl birthday
  // admissionTimeStr graduationTimeStr
  static async menberDetail(id, dorRoomId) {
    let sql = 'SELECT t1.id, t1.name, t1.sex, t1.phone, t1.address, t1.wechat, t1.email, t1.head_img as headImg, t1.school, t1.major, t1.student_num as studentNum, t1.admission_time as admissionTime, t1.graduation_time as graduationTime, t1.dor_building_id as dorBuildingId, t2.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t2.name as dorRoomName, t1.nickname, t1.avatar_url as avatarUrl, t1.birthday FROM tb_students t1 LEFT JOIN tb_dormitory_rooms t2 ON t1.dor_room_id = t2.id WHERE t1.id = ? and t1.dor_room_id = ?;'
    const data = [id, dorRoomId]
    const res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let resData = res.data[0]
      if (resData) {
        resData['admissionTimeStr'] = global.tools.dateFormat(resData['admissionTime'], 'YYYY-MM-DD')
        resData['graduationTimeStr'] = global.tools.dateFormat(resData['graduationTime'], 'YYYY-MM-DD')
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
        throw new global.errs.HttpException('找不到该用户信息或无权访问')
      }
    }
  }

  // 宿舍管理员信息(本栋) 列表
  // 返回
  // id name sex phone headImg position instroduce
  static async adminList(userInfo) {
    let sql = 'SELECT id, name, sex, phone, head_img as headImg, position, instroduce, dor_building_key as dorBuildingKey FROM tb_admin WHERE root = 1;'
    let res = await db.query(sql)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let dataList = res.data
      let dorBuildingId = userInfo.dorBuildingId
      let arr = []
      dataList.forEach(item => {
        let dorBuildingKey = global.toParse(item.dorBuildingKey)
        if (dorBuildingKey.indexOf(dorBuildingId) != -1) {
          delete item.dorBuildingKey
          if (item.headImg) {
            item.headImg = {
              shortName: item.headImg,
              fullName: global.config.imageUrl + item.headImg
            }
          }
          arr.push(item)
        }
      })
      global.success({
        data: arr
      })
    }
  }

  //  宿舍管理员信息(本栋) 详情
  // 返回
  // id name sex phone headImg position instroduce
  static async adminDetail(id, userInfo) {
    let sql = 'SELECT id, name, sex, phone, head_img as headImg, position, instroduce FROM tb_admin WHERE id = ?;'
    const data = [id]
    const res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let resData = res.data[0]
      if (resData.headImg) {
        resData.headImg = {
          shortName: resData.headImg,
          fullName: global.config.imageUrl + resData.headImg
        }
      }
      if (resData) {
        global.success({
          data: resData
        })
      } else {
        throw new global.errs.HttpException('找不到该用户信息')
      }
    }
  }

}

module.exports = UsersModel