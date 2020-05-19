/**
 *                 ---------------该模块包括------------------------
 * 1.宿舍检查 增加 删除 查询列表
 * 2.宿舍申请 查询列表 修改状态
 * 3.宿舍投诉或建议 查询列表 查询详情 修改状态
 *  */

// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/api/admin/doraffair'
})

const {
  ParameterValidator
} = require(`${process.cwd()}/app/validators/validators`)
const DorAffairModel = require(`${process.cwd()}/app/model/admin/dorAffair`)

// 宿舍检查 新增
// 参数 必填 dorBuildingId dorRoomId checkTime startTime endTime type(1-4) title content scope 选填 remark
router.post('/check/add', async (ctx, next) => {
  // 获取参数并校验
  const v = await new ParameterValidator([
    {
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
      key: 'checkTime',
      rules: ['isInt', '参数必传，且需要为整型', {
        min: 1
      }]
    },
    {
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
    {
      key: 'title',
      rules: ['isLength', '参数必传', {
        min: 1
      }]
    },
    {
      key: 'content',
      rules: ['isLength', '参数必传', {
        min: 1
      }]
    },
    {
      key: 'scope',
      rules: ['isInt', '参数必传，且需要为整型', {
        min: 1
      }]
    }
  ]).validate(ctx)
  let type = global.tools.isEnum(ctx.request.body.type, [1, 2, 3, 4], 'type参数有误')
  let params = {
    dorBuildingId: await v.get('body.dorBuildingId'),
    dorRoomId: await v.get('body.dorRoomId'),
    checkTime: await v.get('body.checkTime'),
    startTime: await v.get('body.startTime'),
    endTime: await v.get('body.endTime'),
    type,
    title: await v.get('body.title'),
    content: await v.get('body.content'),
    scope: await v.get('body.scope'),
    remark: await v.get('body.remark')
  }
  await DorAffairModel.checkAdd(params, ctx.authAdmin)
})

// 宿舍检查 删除
// 参数 必填 ids
router.post('/check/delete', async (ctx, next) => {
  // 获取参数并校验
  let v = await new ParameterValidator([{
    key: 'ids',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let ids = await v.get('body.ids')
  await DorAffairModel.checkDelete(ids)
})

// 宿舍检查 查询列表
// 参数 选填 keyword dorBuildingId dorRoomId type(多选) scope pageNo pageSize
router.post('/check/list', async (ctx, next) => {
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
    scope: ctx.request.body.scope
  }
  await DorAffairModel.checkList(params)
})

// -------------- 2.宿舍申请 查询列表 修改状态 -------------

// 宿舍申请 查询列表
// 参数 选填 keyword dorBuildingId dorRoomId status(0-3) pageNo pageSize
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
    status: ctx.request.body.status
  }
  await DorAffairModel.applyList(params)
})

// 学生个人事务申请 修改状态
// 参数 必填 id status 选填 replyContent remark
router.post('/apply/edit', async (ctx, next) => {
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
  }
  await DorAffairModel.applyEdit(params, ctx.authAdmin)
})

// -------------- 3.宿舍投诉或建议 查询列表 查询详情 修改状态 -------------

// 宿舍投诉或建议 查询列表
// 参数 选填 keyword dorBuildingId dorRoomId type status(0-2) pageNo pageSize
router.post('/suggestion/list', async (ctx, next) => {
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
    status: ctx.request.body.status
  }
  await DorAffairModel.suggestionList(params)
})

// 宿舍投诉或建议 查询详情
// 参数 必填 id
router.post('/suggestion/detail', async (ctx, next) => {
  // 获取参数并校验
  let v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let id = await v.get('body.id')
  await DorAffairModel.suggestionDetail(id)
})


// 宿舍投诉或建议 修改状态
// 参数 必填 id status 选填 replyContent remark
router.post('/suggestion/edit', async (ctx, next) => {
  // 获取参数并校验
  const status = global.tools.isEnum(ctx.request.body.status, [0, 2], 'status参数有误')
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
  }
  await DorAffairModel.suggestionEdit(params, ctx.authAdmin)
})

module.exports = router