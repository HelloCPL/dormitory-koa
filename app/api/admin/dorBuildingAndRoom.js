/**
 *                 ---------------该模块包括------------------------
 * 1.宿舍栋 新增 编辑 查看列表 删除
 * 2.宿舍房间 新增 编辑 查看列表 删除
 *  */

// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/api/admin'
})

const {
  ParameterValidator,
  adminDorBuildingDeleteVaildator,
  adminDorRoomVaildator,
  adminDorRoomDeleteVaildator
} = require(`${process.cwd()}/app/validators/validators`)
const DorBuildingAndRoomModel = require(`${process.cwd()}/app/model/admin/dorBuildingAndRoom`)

// -------------------- 1.宿舍栋 新增 编辑 查看列表 删除 ----------------------

// 宿舍栋 新增
// 参数 必填 name 选填 desc
router.post('/dorbuilding/add', async (ctx, next) => {
  // 获取参数并校验
  const v = await new ParameterValidator([{
    key: 'name',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let params = {
    name: await v.get('body.name'),
    desc: await v.get('body.desc'),
  }
  // 插入数据
  await DorBuildingAndRoomModel.dorBuildingAdd(params)
})

// 宿舍栋 编辑
// 参数 必填 id name 选填 desc
router.post('/dorbuilding/edit', async (ctx, next) => {
  // 获取参数并校验
  const v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }, {
    key: 'name',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let params = {
    id: await v.get('body.id'),
    name: await v.get('body.name'),
    desc: await v.get('body.desc'),
  }
  // 插入数据
  await DorBuildingAndRoomModel.dorBuildingEdit(params)
})

// 宿舍栋 删除
// 参数 必填 id 用 英文逗号隔开
router.post('/dorbuilding/delete', async (ctx, next) => {
  // 获取参数并校验
  const v = await new adminDorBuildingDeleteVaildator().validate(ctx)
  let id = await v.get('body.id')
  // 插入数据
  await DorBuildingAndRoomModel.dorBuildingDelete(id)
})

// 宿舍栋 查询
// 参数 选填 pageNo pageSize keyword 
router.post('/dorbuilding/list', async (ctx, next) => {
  // 获取参数
  let keyword = ctx.request.body.keyword
  const pageNo = Number(ctx.request.body.pageNo) || 1
  const pageSize = Number(ctx.request.body.pageSize) || 10
  // 插入数据
  await DorBuildingAndRoomModel.dorBuildingList(keyword, pageNo, pageSize)
})

// -------------------- 2.宿舍房间 新增 编辑 查看列表 删除 ----------------------

// 宿舍房间 新增
// 参数 必填 name total dorBuildingId dorBuildingName   选填 remark
router.post('/dorroom/add', async (ctx, next) => {
  // 获取参数并校验
  const v = await new adminDorRoomVaildator().validate(ctx)
  let params = {
    name: await v.get('body.name'),
    total: await v.get('body.total'),
    dorBuildingId: await v.get('body.dorBuildingId'),
    dorBuildingName: await v.get('body.dorBuildingName'),
    remark: await v.get('body.remark'),
  }
  // 插入数据
  await DorBuildingAndRoomModel.dorRoomAdd(params)
})

// 宿舍房间 edit
// 参数 必填 id name total dorBuildingId dorBuildingName   选填 remark
router.post('/dorroom/edit', async (ctx, next) => {
  // 获取参数并校验
  const v = await new adminDorRoomVaildator(true).validate(ctx)
  let params = {
    id: await v.get('body.id'),
    name: await v.get('body.name'),
    total: await v.get('body.total'),
    dorBuildingId: await v.get('body.dorBuildingId'),
    dorBuildingName: await v.get('body.dorBuildingName'),
    remark: await v.get('body.remark'),
  }
  // 插入数据
  await DorBuildingAndRoomModel.dorRoomEdit(params)
})

// 宿舍房间 删除
// 参数 必填 id dorBuildingId
router.post('/dorroom/delete', async (ctx, next) => {
  // 获取参数并校验
  const v = await new adminDorRoomDeleteVaildator().validate(ctx)
  let id = await v.get('body.id')
  let dorBuildingId = await v.get('body.dorBuildingId')
  // 插入数据
  await DorBuildingAndRoomModel.dorRoomDelete(id, dorBuildingId)
})

// 宿舍房间 查询列表
// 参数 选填 keyword dorBuildingId pageNo pageSize
router.post('/dorroom/list', async (ctx, next) => {
  // 获取参数
  let keyword = ctx.request.body.keyword
  let dorBuildingId = ctx.request.body.dorBuildingId
  const pageNo = Number(ctx.request.body.pageNo) || 1
  const pageSize = Number(ctx.request.body.pageSize) || 10
  // 插入数据
  await DorBuildingAndRoomModel.dorRoomList(keyword, dorBuildingId, pageNo, pageSize)
})

// 宿舍房间 查询详情
// 参数 必填 id
router.post('/dorroom/detail', async (ctx, next) => {
  // 获取参数并校验
  const v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let id = await v.get('body.id')
  // 插入数据
  await DorBuildingAndRoomModel.dorRoomDetail(id)
})

module.exports = router