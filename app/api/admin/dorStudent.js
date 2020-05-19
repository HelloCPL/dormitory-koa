/**
 *                 ---------------该模块包括------------------------
 * 1.学生离返校 查询列表
 * 2.学生个人物品 查询列表 修改状态
 * 3.学生个人事务申请 查询列表 编辑
 *  */

// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/api/admin/dorstudent'
})

const {
  ParameterValidator
} = require(`${process.cwd()}/app/validators/validators`)
const DorStudentModel = require(`${process.cwd()}/app/model/admin/dorStudent`)

// ------------ 1.学生离返校 查询列表 -----------

// 学生离返校 查询列表
// 参数 选填 keyword dorBuildingId dorRoomId timeStatus(1 未开始 2 离校中 0 已返校) pageNo pageSize
router.post('/status/atschool', async (ctx, next) => {
  // 获取参数并校验
  let pageNo = Number(ctx.request.body.pageNo) || 1
  let pageSize = Number(ctx.request.body.pageSize) || 10
  let params = {
    pageNo,
    pageSize,
    keyword: ctx.request.body.keyword,
    dorBuildingId: ctx.request.body.dorBuildingId,
    dorRoomId: ctx.request.body.dorRoomId,
    timeStatus: ctx.request.body.timeStatus
  }
  await DorStudentModel.statusAtschool(params)
})

// -------------- 2.学生个人物品 查询列表 修改状态 -------------

// 学生个人物品 查询列表
// 参数 选填 keyword dorBuildingId dorRoomId status(1 保存中 2 外带中 0 已注销) pageNo pageSize
router.post('/property/list', async (ctx, next) => {
  // 获取参数并校验
  let pageNo = Number(ctx.request.body.pageNo) || 1
  let pageSize = Number(ctx.request.body.pageSize) || 10
  let params = {
    pageNo,
    pageSize,
    keyword: ctx.request.body.keyword,
    dorBuildingId: ctx.request.body.dorBuildingId,
    dorRoomId: ctx.request.body.dorRoomId,
    status: ctx.request.body.status
  }
  await DorStudentModel.propertyList(params)
})

// 学生个人物品 修改状态
// 参数 必填 id status [1 2]
router.post('/property/edit', async (ctx, next) => {
  // 获取参数并校验
  const status = global.tools.isEnum(ctx.request.body.status, [1, 2], 'status参数有误')
  const v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let id = await v.get('body.id')
  await DorStudentModel.propertyEdit(id, status)
})

// -------------- 3.学生个人事务申请 查询列表 修改状态 -------------

// 学生个人事务申请 查询列表
// 参数 选填 keyword dorBuildingId dorRoomId type(1-4 多选) replyStatus(0-3) pageNo pageSize
router.post('/apply/list', async (ctx, next) => {
  // 获取参数并校验
  let pageNo = Number(ctx.request.body.pageNo) || 1
  let pageSize = Number(ctx.request.body.pageSize) || 10
  let params = {
    pageNo,
    pageSize,
    keyword: ctx.request.body.keyword,
    dorBuildingId: ctx.request.body.dorBuildingId,
    dorRoomId: ctx.request.body.dorRoomId,
    type: ctx.request.body.type,
    replyStatus: ctx.request.body.replyStatus
  }
  await DorStudentModel.applyList(params)
})

// 学生个人事务申请 修改状态
// 参数 必填 id replyStatus 选填 replyContent
router.post('/apply/edit', async (ctx, next) => {
  // 获取参数并校验
  const replyStatus = global.tools.isEnum(ctx.request.body.replyStatus, [0, 2, 3], 'replyStatus参数有误')
  const v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let params = {
    replyStatus,
    id: await v.get('body.id'),
    replyContent: await v.get('body.replyContent'),
  }
  await DorStudentModel.applyEdit(params, ctx.authAdmin)
})

module.exports = router