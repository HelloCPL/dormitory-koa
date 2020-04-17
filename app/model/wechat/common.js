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
}

module.exports = CommonModel