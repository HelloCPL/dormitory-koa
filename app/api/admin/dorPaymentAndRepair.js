/**
 *                 ---------------该模块包括------------------------
 * 1.宿舍维修 查询列表 修改状态
 *  */

// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/api/admin/doraffair'
})

const {
  ParameterValidator
} = require(`${process.cwd()}/app/validators/validators`)
const DorPaymentAndRepairModel = require(`${process.cwd()}/app/model/admin/dorPaymentAndRepair`)

// 宿舍维修 查询列表
// 参数 选填 keyword dorBuildingId dorRoomId status pageNo pageSize
router.post('/repair/list', async (ctx, next) => {
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
  await DorPaymentAndRepairModel.repairList(params)
})

// 宿舍维修 修改状态
// 参数 必填 id status 选填 replyContent remark repairWorker repairTime
router.post('/repair/edit', async (ctx, next) => {
  // 获取参数并校验
  const status = global.tools.isEnum(ctx.request.body.status, [0, 2, 3], 'status参数有误')
  const v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let params = {
    status,
    id: await v.get('body.id'),
    replyContent: await v.get('body.replyContent'),
    remark: await v.get('body.remark'),
    repairWorker: await v.get('body.repairWorker'),
    repairTime: await v.get('body.repairTime')
  }
  await DorPaymentAndRepairModel.repairEdit(params, ctx.authAdmin)
})

module.exports = router