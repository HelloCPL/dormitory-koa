/**
 *                 ---------------该模块包括------------------------
 * 1.宿舍维修 查询列表 修改状态
 * 2.缴费 新增 查看列表 修改状态
 *  */

// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/api/admin/doraffair'
})

const {
  ParameterValidator,
  adminDormitoryPaymentEdit
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

// ----------------- 2.缴费 新增 查看列表 修改状态 ---------------------

// 缴费 新增
// 参数 必填 dorBuildingId dorRoomId title price  startTime endTime  选填 content remark
router.post('/payment/add', async (ctx, next) => {
  // 获取参数并校验
  const v = await new ParameterValidator([{
      key: 'dorBuildingId',
      rules: ['isLength', '参数必传', {
        min: 1
      }]
    },
    {
      key: 'dorRoomId',
      rules: ['isLength', '参数必传', {
        min: 1
      }]
    },
    {
      key: 'title',
      rules: ['isLength', '参数必传', {
        min: 1
      }]
    },
    {
      key: 'price',
      rules: ['isLength', '参数必传', {
        min: 1
      }]
    }, {
      key: 'startTime',
      rules: ['isInt', '参数必传，且需要为整型', {
        min: 1
      }]
    },
    {
      key: 'endTime',
      rules: ['isInt', '参数必传，且需要为整型', {
        min: 1
      }]
    },

  ]).validate(ctx)
  let params = {
    dorBuildingId: await v.get('body.dorBuildingId'),
    dorRoomId: await v.get('body.dorRoomId'),
    title: await v.get('body.title'),
    price: await v.get('body.price'),
    startTime: await v.get('body.startTime'),
    endTime: await v.get('body.endTime'),
    content: await v.get('body.content'),
    remark: await v.get('body.remark'),
  }
  await DorPaymentAndRepairModel.paymentAdd(params, ctx.authAdmin)
})

// 缴费 查看列表
// 参数 选填 keyword dorBuildingId dorRoomId status pageNo pageSize
router.post('/payment/list', async (ctx, next) => {
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
  await DorPaymentAndRepairModel.paymentList(params)
})

// 缴费 编辑状态
// 参数 必填 id keyCode(暂时传1) status （2 已缴费 3 已线上缴费 0 已取消）
router.post('/payment/edit', async (ctx, next) => {
  let status = global.tools.isEnum(ctx.request.body.status, [0, 2, 3], 'status参数有误')
  let keyCode = global.tools.isEnum(ctx.request.body.keyCode, [1], 'keyCode参数有误')
  const v = await new adminDormitoryPaymentEdit().validate(ctx)
  let params = {
    id: await v.get('body.id'),
    status,
    keyCode
  }
  await DorPaymentAndRepairModel.paymentEdit(params, ctx.authAdmin)
})

// 缴费 删除
// 参数 必填 ids
router.post('/payment/delete', async (ctx, next) => {
  // 获取参数并校验
  let v = await new ParameterValidator([{
    key: 'ids',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let ids = await v.get('body.ids')
  await DorPaymentAndRepairModel.paymentDelete(ids)
})


module.exports = router