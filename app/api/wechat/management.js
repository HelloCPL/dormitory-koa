/**
 *                 ---------------该模块包括------------------------
 * 1.日常公告管理（ 公告 日常管理 管理规定 服务指南 安全警示 中心简介）
 * 2.图片管理 （轮播 宿舍相关信息图 广告图）
 * 
 *  */

// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/api/wechat/management'
})

const {
  ParameterValidator,
} = require(`${process.cwd()}/app/validators/wechat/validators`)
// const CommonModel = require(`${process.cwd()}/app/model/wechat/common`)
const ManagementModel = require(`${process.cwd()}/app/model/wechat/management`)

// ------- 1.日常公告管理（ 公告 日常管理 管理规定 服务指南 安全警示 中心简介） -------------

// 日常管理 查询列表
// 参数 必填 type [1, 2, 3, 4, 5, 6] 选填 pageNo 默认 1 pageSize 默认 10
router.post('/notices/list', async (ctx, next) => {
  // 获取参数并校验
  const type = global.tools.isEnum(ctx.request.body.type, [1, 2, 3, 4, 5, 6], 'type参数有误')
  const pageNo = Number(ctx.request.body.pageNo) || 1
  const pageSize = Number(ctx.request.body.pageSize) || 10
  // 查询数据并返回
  await ManagementModel.noticesList(type, pageNo, pageSize)
})

// 日常管理 查询详情
// 参数 必填 id
router.post('/notices/detail', async (ctx, next) => {
  // 获取参数并校验
  const v = await new ParameterValidator({
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }).validate(ctx)
  let id = await v.get('body.id')
  // 查询数据并返回
  await ManagementModel.noticesDetail(id)
})

// ---------------- 2.图片管理（ 轮播 宿舍相关信息图 广告图） --------------

// 图片管理 查询列表
// 参数 必填 type [1, 2, 3] 选填 pageNo 默认 1 pageSize 默认 10
router.post('/images/list', async (ctx, next) => {
  // 获取参数并校验
  const type = global.tools.isEnum(ctx.request.body.type, [1, 2, 3], 'type参数有误')
  const pageNo = Number(ctx.request.body.pageNo) || 1
  const pageSize = Number(ctx.request.body.pageSize) || 10
  // 查询数据并返回
  await ManagementModel.imagesList(type, pageNo, pageSize)
})
module.exports = router