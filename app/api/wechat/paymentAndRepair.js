/**
 *                 ---------------该模块包括------------------------
 * 1.宿舍报修 增加 查看列表 删除 修改评价
 * 2.宿舍缴费 查看列表 查看详情 支付
 * 
 *  */

// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/api/wechat/dormitory'
})

const {
  ParameterValidator
} = require(`${process.cwd()}/app/validators/validators`)
const CommonModel = require(`${process.cwd()}/app/model/wechat/common`)
const PaymentAndRepairModel = require(`${process.cwd()}/app/model/wechat/paymentAndRepair`)

//  -------------- 1.宿舍报修 增加 列表 评价 删除 -----------------

// 宿舍报修 增加
// 参数 必填 content 选填 imgList 图片短路经数组
router.post('/repair/add', async (ctx, next) => {
  // 获取参数
  const v = await new ParameterValidator([{
    key: 'content',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let content = await v.get('body.content')
  let imgList = global.toStringify(ctx.request.body.imgList)
  let userInfo = await CommonModel.getUserInfo(ctx.auth)
  // 查询数据并返回
  await PaymentAndRepairModel.repairAdd(content, imgList, userInfo)
})

// 宿舍报修 查看列表
// 参数 必填 status (0 1 2 3 4 all) 选填 pageNo pageSize
router.post('/repair/list', async (ctx, next) => {
  // 获取参数
  let status = global.tools.isEnum(ctx.request.body.status, [0, 1, 2, 3, 4, 'all'], 'status参数有误')
  const pageNo = Number(ctx.request.body.pageNo) || 1
  const pageSize = Number(ctx.request.body.pageSize) || 10
  // 查询数据并返回
  await PaymentAndRepairModel.repairList(status, pageNo, pageSize, ctx.auth)
})

// 宿舍报修  删除
// 参数 必填 id
router.post('/repair/delete', async (ctx, next) => {
  // 获取参数
  const v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let id = await v.get('body.id')
  // 查询数据并返回
  await PaymentAndRepairModel.repairDelete(id, ctx.auth)
})

// 宿舍报修  修改评价
// 参数 必填 id evaluationId
router.post('/repair/evaluate', async (ctx, next) => {
  // 获取参数
  const v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }, {
    key: 'evaluationId',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let id = await v.get('body.id')
  let evaluationId = await v.get('body.evaluationId')
  // 查询数据并返回
  await PaymentAndRepairModel.repairEvaluate(id, evaluationId, ctx.auth)
})

// ------------------------ 2. 宿舍缴费 查看列表 支付 ----------------------------

// 宿舍缴费 查看列表
// 参数 必填 status (0 1 2 3 用逗号隔开) 选填 pageNo pageSize
router.post('/payment/list', async (ctx, next) => {
  // 获取参数
  const pageNo = Number(ctx.request.body.pageNo) || 1
  const pageSize = Number(ctx.request.body.pageSize) || 10
  // 查询数据并返回
  await PaymentAndRepairModel.paymentList(ctx.request.body.status, pageNo, pageSize, ctx.auth)
})

// 宿舍缴费 详情
// 参数 必填 id 
router.post('/payment/detail', async (ctx, next) => {
  // 获取参数
  const v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let id = await v.get('body.id')
  // 查询数据并返回
  await PaymentAndRepairModel.paymentDetail(id, ctx.auth)
})

// 宿舍缴费 支付
// 参数 必填 id keyCode (暂时传 1)
router.post('/payment/pay', async (ctx, next) => {
  // 获取参数
  let keyCode = global.tools.isEnum(ctx.request.body.keyCode, [1], 'keyCode参数有误')
  const v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let id = await v.get('body.id')
  // 查询数据并返回
  await PaymentAndRepairModel.paymentPay(id, keyCode, ctx.auth)
})

module.exports = router