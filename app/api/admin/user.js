/**
 *                 ---------------该模块包括------------------------
 * 1.登录接口  
 * 2.请求token
 * 3.校验token
 * 4.学生信息 增加 编辑 删除 查询详情 查看列表
 * 5.管理员信息 增加 编辑 删除 查看列表
 *  */

// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/api/admin'
})

const {
  ParameterValidator,
  loginVaildator,
  adminTokenVaildator,
  adminStudentInfoVaildator,
  adminStudentInfoDeleteVaildator
} = require(`${process.cwd()}/app/validators/validators`)
const UsersModel = require(`${process.cwd()}/app/model/admin/user`)


// 登录接口
// 参数 必填 username password
router.post('/login', async (ctx, next) => {
  // 获取并校验参数
  const v = await new loginVaildator().validate(ctx)
  let username = await v.get('body.username')
  // 返回管理员信息及其权限
  await UsersModel.findAdminInfo(username)
})

// 请求生成token 
// 参数 必填 id 
router.post('/token/generate', async (ctx, next) => {
  const Auth = require(`${process.cwd()}/middlewares/admin/auth`)
  // 获取参数并校验参数
  const v = await new adminTokenVaildator().validate(ctx)
  let id = await v.get('body.id')
  const token = Auth.generateToken(id)
  // 返回token
  global.success({
    data: token
  })
})

// 校验token是否合法 
// 参数 必填 token
router.post('/token/verify', async (ctx, next) => {

})

router.post('/test', async (ctx, next) => {
  global.success({
    data: 'test'
  })
})

// ------------------  4.学生信息 增加 编辑 删除 查看列表 -------------------

// 学生信息 新增
// 参数 必填 name sex school major studentNum admissionTime graduationTime dorBuildingId dorRoomId 选填 phone birthday address wechat email headImg
router.post('/student/info/add', async (ctx, next) => {
  // 获取参数并校验
  const v = await new adminStudentInfoVaildator().validate(ctx)
  let params = {
    name: await v.get('body.name'),
    sex: await v.get('body.sex'),
    school: await v.get('body.school'),
    major: await v.get('body.major'),
    studentNum: await v.get('body.studentNum'),
    admissionTime: await v.get('body.admissionTime'),
    graduationTime: await v.get('body.graduationTime'),
    dorBuildingId: await v.get('body.dorBuildingId'),
    dorRoomId: await v.get('body.dorRoomId'),
    phone: await v.get('body.phone'),
    birthday: await v.get('body.birthday'),
    address: await v.get('body.address'),
    wechat: await v.get('body.wechat'),
    email: await v.get('body.email'),
    headImg: await v.get('body.headImg')
  }
  // 插入数据
  await UsersModel.studentInfoAdd(params)
})

// 学生信息 编辑
// 参数 必填 id name sex school major studentNum admissionTime graduationTime dorBuildingId dorRoomId 选填 phone birthday address wechat email headImg
router.post('/student/info/edit', async (ctx, next) => {
  // 获取参数并校验
  const v = await new adminStudentInfoVaildator(true).validate(ctx)
  let params = {
    id: await v.get('body.id'),
    name: await v.get('body.name'),
    sex: await v.get('body.sex'),
    school: await v.get('body.school'),
    major: await v.get('body.major'),
    studentNum: await v.get('body.studentNum'),
    admissionTime: await v.get('body.admissionTime'),
    graduationTime: await v.get('body.graduationTime'),
    dorBuildingId: await v.get('body.dorBuildingId'),
    dorRoomId: await v.get('body.dorRoomId'),
    phone: await v.get('body.phone'),
    birthday: await v.get('body.birthday'),
    address: await v.get('body.address'),
    wechat: await v.get('body.wechat'),
    email: await v.get('body.email'),
    headImg: await v.get('body.headImg')
  }
  // 插入数据
  await UsersModel.studentInfoEdit(params)
})

// 学生信息 删除
// 参数 必填 id dorRoomId
router.post('/student/info/delete', async (ctx, next) => {
  // 获取参数并校验
  const v = await new adminStudentInfoDeleteVaildator().validate(ctx)
  let id = await v.get('body.id')
  let dorRoomId = await v.get('body.dorRoomId')
  // 插入数据
  await UsersModel.studentInfoDelete(id, dorRoomId)
})

// 学生信息 查询列表
// 参数 选填 keyword dorBuildingId dorRoomId pageNo pageSize
router.post('/student/info/list', async (ctx, next) => {
  // 获取参数
  let keyword = ctx.request.body.keyword
  let dorBuildingId = ctx.request.body.dorBuildingId
  let dorRoomId = ctx.request.body.dorRoomId
  const pageNo = Number(ctx.request.body.pageNo) || 1
  const pageSize = Number(ctx.request.body.pageSize) || 10
  // 插入数据
  await UsersModel.studentInfoList(keyword, dorBuildingId, dorRoomId, pageNo, pageSize)
})

// 学生信息 查询详情
// 参数 必填 id 
router.post('/student/info/detail', async (ctx, next) => {
  // 获取参数并校验
  const v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let id = await v.get('body.id')
  // 插入数据
  await UsersModel.studentInfoDetail(id)
})


module.exports = router