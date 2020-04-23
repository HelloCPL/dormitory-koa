const {
  db
} = require(`${process.cwd()}/core/db`)

class CommonModel {
  // 获取用户信息并返回
  static async getUserInfo(auth) {
    // const sql = 'SELECT * FROM tb_students WHERE id = ?'
    let sql = 'SELECT t1.id, t1.name, t1.sex, t1.phone, t1.address, t1.wechat, t1.email, t1.head_img as headImg, t1.school, t1.major, t1.student_num as studentNum, t1.admission_time as admissionTime, t1.graduation_time as graduationTime, t1.dor_building_id as dorBuildingId, t2.dor_building_name as dorBuildingName, t1.dor_room_id as dorRoomId, t2.name as dorRoomName, t1.open_id as openId, t1.nickname, t1.avatar_url as avatarUrl FROM tb_students t1 LEFT JOIN tb_dormitory_rooms t2 ON t1.dor_room_id = t2.id WHERE t1.id = ?;'
    const data = [auth.studentId]
    const res = await db.query(sql, data)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let resData = res.data[0]
      resData['admissionTimeStr'] = global.tools.dateFormat(resData['admissionTime'], 'YYYY-MM-DD')
      resData['graduationTimeStr'] = global.tools.dateFormat(resData['graduationTime'], 'YYYY-MM-DD')
      return resData
    }
  }

  // 评价 增加
  // 返回 评价 id
  static async evaluationAdd(params, user) {
    let createTime = global.tools.getTimeValue()
    let sqlList = [
      {
        sql: `INSERT tb_evaluation (key_id, type, release_user_id, create_time, scope, content, remark) VALUES (?, ?, ?, ?, ?, ?, ?);`,
        data: [params.keyId, params.type, user.studentId, createTime, params.scope, params.content, params.remark]
      },
      {
        sql: 'SELECT LAST_INSERT_ID() as id;'
      }
    ]
    const res = await db.execTrans(sqlList)
    if (res.err) {
      throw new global.errs.HttpException(res.err)
    } else {
      let id = res.data[1][0]['id']
      global.success({
        data: {
          id,
          keyId: params.keyId,
          type: params.type,
          releaseUserId: user.studentId,
          createTime,
          createTImeStr: global.tools.dateFormat(createTime, 'YYYY-MM-DD hh:mm:ss'),
          scope: params.scope,
          content: params.content,
          remark: params.remark
        }
      })
    }
  }

  // 评价 删除
  static async evaluationDelete(id, user) {
    let sql = 'DELETE FROM tb_evaluation WHERE id = ? and release_user_id = ?;'
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

module.exports = CommonModel