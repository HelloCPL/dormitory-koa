/**
 *                 ---------------该模块包括------------------------
 * 1.学生个人物品 新增 查询 修改存放状态  删除
 * 2.学生个人事务申请 新增 查询 删除
 * 3.学生离返校登记 新增 查询 修改状态 删除
 *  */

// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/api/wechat/student'
})

const {
  ParameterValidator,
} = require(`${process.cwd()}/app/validators/validators`)
const CommonModel = require(`${process.cwd()}/app/model/wechat/common`)
const StudentsModel = require(`${process.cwd()}/app/model/wechat/students`)

// ------------------------- 1.学生个人物品 --------------------------

// 学生个人物品 新增 
// 参数 必填 name 数组
router.post('/property/add', async (ctx, next) => {
  // 获取并校验参数
  const name = global.tools.judgeArray(ctx.request.body.name, 'name参数有误')
  // 获取用户信息
  const userInfo = await CommonModel.getUserInfo(ctx.auth)
  console.log(name)
  console.log(userInfo)
  // 插入数据并返回
  await StudentsModel.addProperty(name, userInfo)
})

// 学生个人物品 查询 
// 参数 选填 pageNo 默认 1 pageSize 默认 10
router.post('/property/check', async (ctx, next) => {
  // 获取参数
  const pageNo = Number(ctx.request.body.pageNo) || 1
  const pageSize = Number(ctx.request.body.pageSize) || 10
  const userInfo = await CommonModel.getUserInfo(ctx.auth)
  // 查询数据并返回
  await StudentsModel.checkProperty(pageNo, pageSize, userInfo)
})

// 学生个人物品 修改存放状态
// 参数 必填 status [0, 1, 2] id
router.post('/property/edit', async (ctx, next) => {
  // 获取并校验参数
  const status = global.tools.isEnum(ctx.request.body.status, [0, 1, 2], 'status参数有误')
  const v = await new ParameterValidator({
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }).validate(ctx)
  let id = await v.get('body.id')
  const userInfo = await CommonModel.getUserInfo(ctx.auth)
  // 更新数据
  await StudentsModel.editProperty(status, id, userInfo.id)
})

// 学生个人物品 删除
// 参数 必填 id
router.post('/property/delete', async (ctx, next) => {
  // 获取并校验参数
  const v = await new ParameterValidator({
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }).validate(ctx)
  let id = await v.get('body.id')
  const userInfo = await CommonModel.getUserInfo(ctx.auth)
  // 删除数据
  await StudentsModel.deleteProperty(id, userInfo.id)
})

// ------------------------- 2.学生个人事务申请 --------------------------

// 学生个人事务申请 增加
// 参数 必填 type [1, 2, 3, 4] content startTime endTime  选填 reason
router.post('/apply/add', async (ctx, next) => {
  // 获取并校验参数
  const type = global.tools.isEnum(ctx.request.body.type, [1, 2, 3, 4], 'type参数有误')
  const v = await new ParameterValidator([{
      key: 'content',
      rules: ['isLength', '参数必传', {
        min: 1
      }]
    },
    {
      key: 'startTime',
      rules: ['isInt', '参数必须为整型的时间戳', {
        min: 1
      }]
    },
    {
      key: 'endTime',
      rules: ['isInt', '参数必须为整型的时间戳', {
        min: 1
      }]
    }
  ]).validate(ctx)
  let startTime = await v.get('body.startTime')
  let endTime = await v.get('body.endTime')
  global.tools.isLessThan(startTime, endTime)
  let params = {
    type,
    content: await v.get('body.content'),
    reason: await v.get('body.reason'),
    startTime,
    endTime
  }
  // 获取用户信息
  const userInfo = await CommonModel.getUserInfo(ctx.auth)
  // 插入数据并返回
  await StudentsModel.addApply(params, userInfo)
})

// 学生个人事务申请 查询
// 参数 选填 pageNo 默认 1 pageSize 默认 10
router.post('/apply/check', async (ctx, next) => {
  // 获取参数
  const pageNo = Number(ctx.request.body.pageNo) || 1
  const pageSize = Number(ctx.request.body.pageSize) || 10
  const userInfo = await CommonModel.getUserInfo(ctx.auth)
  // 查询数据并返回
  await StudentsModel.checkApply(pageNo, pageSize, userInfo)
})

// 学生个人事务申请 删除 仅当 reply_status 为 0 时可删除
// 参数 必填 id
router.post('/apply/delete', async (ctx, next) => {
  // 获取并校验参数
  const v = await new ParameterValidator({
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }).validate(ctx)
  let id = await v.get('body.id')
  const userInfo = await CommonModel.getUserInfo(ctx.auth)
  // 删除数据
  await StudentsModel.deleteApply(id, userInfo.id)
})

// --------------------- 3.学生个人离返校登记 -------------------------

// 学生个人离返校登记 新增
// 参数 必填 startTime endTime 选填 remark
router.post('/status/atschool/add', async (ctx, next) => {
  // 获取并校验参数
  const v = await new ParameterValidator([
    {
      key: 'startTime',
      rules: ['isInt', '参数必须为整型的时间戳', {
        min: 1
      }]
    },
    {
      key: 'endTime',
      rules: ['isInt', '参数必须为整型的时间戳', {
        min: 1
      }]
    }
  ]).validate(ctx)
  let startTime = await v.get('body.startTime')
  let endTime = await v.get('body.endTime')
  global.tools.isLessThan(startTime, endTime)
  let params = {
    remark: await v.get('body.remark'),
    startTime,
    endTime
  }
  // 获取用户信息
  const userInfo = await CommonModel.getUserInfo(ctx.auth)
  // 插入数据并返回
  await StudentsModel.addStatusAtschool(params, userInfo)
})

// 学生个人离返校登记 查询
// 学生个人事务申请 查询
// 参数 选填 pageNo 默认 1 pageSize 默认 10
router.post('/status/atschool/check', async (ctx, next) => {
  // 获取参数
  const pageNo = Number(ctx.request.body.pageNo) || 1
  const pageSize = Number(ctx.request.body.pageSize) || 10
  const userInfo = await CommonModel.getUserInfo(ctx.auth)
  // 查询数据并返回
  await StudentsModel.checkStatusAtschool(pageNo, pageSize, userInfo)
})

// 学生个人离返校登记 修改状态 仅当 status 为 1 或 2 可修改 仅可修改为 0
// 参数 必填 status [0] id
router.post('/status/atschool/edit', async (ctx, next) => {
  // 获取并校验参数
  const status = global.tools.isEnum(ctx.request.body.status, [0], 'status参数有误')
  const v = await new ParameterValidator({
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }).validate(ctx)
  let id = await v.get('body.id')
  const userInfo = await CommonModel.getUserInfo(ctx.auth)
  // 更新数据
  await StudentsModel.editStatusAtschool(status, id, userInfo.id)
})

// 学生个人离返校登记 删除
// 参数 必填 id
router.post('/status/atschool/delete', async (ctx, next) => {
  // 获取并校验参数
  const v = await new ParameterValidator({
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }).validate(ctx)
  let id = await v.get('body.id')
  const userInfo = await CommonModel.getUserInfo(ctx.auth)
  // 删除数据
  await StudentsModel.deleteStatusAtschool(id, userInfo.id)
})

module.exports = router