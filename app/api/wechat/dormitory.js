/**
 *                 ---------------该模块包括------------------------
 * 1.学生宿舍值班表 编辑 查看详情
 * 2.学生宿舍自定义日程表 增加 查看列表 删除
 * 3.评优、违纪、卫生检查 查看列表
 * 4.宿舍投诉/建议 增加 查看列表 删除
 * 5.宿舍申请 增加 查看列表 删除
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
const DormitoryModel = require(`${process.cwd()}/app/model/wechat/dormitory`)

//  -------------- 1.学生宿舍值班表 编辑 查看详情 -----------------

// 学生宿舍值班表 编辑
// 参数 必填 type 周一至周日 任一一个 data 数组 （用逗号隔开，可为空）
router.post('/duty/edit', async (ctx, next) => {
  // 获取参数并校验
  let typeList = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const type = global.tools.isEnum(ctx.request.body.type, typeList, 'type参数有误')
  // 插入更改数据
  await DormitoryModel.dutyEdit(type, ctx.request.body.data, ctx.auth)
})

// 学生宿舍值班表 查看详情
router.post('/duty/check', async (ctx, next) => {
  // 查询并返回数据
  await DormitoryModel.dutyCheck(ctx.auth)
})

//  -------------- 2.学生宿舍自定义日程表 增加 查看列表 删除 -----------------

// 学生宿舍自定义日程表 增加
// 参数 必填 title content remindTime 选填 label
router.post('/schedule/add', async (ctx, next) => {
  // 获取参数并校验
  const v = await new ParameterValidator([{
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
      key: 'remindTime',
      rules: ['isInt', '参数必须为整型的时间戳', {
        min: 1
      }]
    }
  ]).validate(ctx)
  let params = {
    title: await v.get('body.title'),
    content: await v.get('body.content'),
    remindTime: await v.get('body.remindTime'),
    label: await v.get('body.label')
  }
  // 插入数据
  await DormitoryModel.scheduleAdd(params, ctx.auth)
})

// 学生宿舍自定义日程表 查看某天所有列表
// 参数 必填 day 某天 任意格式
router.post('/schedule/check', async (ctx, next) => {
  // 获取参数
  const v = await new ParameterValidator([{
    key: 'day',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let day = await v.get('body.day')
  day = global.tools.dateFormat(day, 'YYYY-MM-DD')
  // 查询数据并返回
  await DormitoryModel.scheduleCheck(day, ctx.auth)
})

// 学生宿舍自定义日程表 删除
// 参数 必填 id
router.post('/schedule/delete', async (ctx, next) => {
  // 获取参数
  const v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let id = await v.get('body.id')
  // 查询数据并返回
  await DormitoryModel.scheduleDelete(id, ctx.auth)
})

// 学生宿舍自定义日程表 获取本月所有有数据的天数
// 参数 必填 month 某月 任意格式
router.post('/schedule/month/list', async (ctx, next) => {
  // 获取参数
  const v = await new ParameterValidator([{
    key: 'month',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let month = await v.get('body.month')
  month = global.tools.dateFormat(month, 'YYYY-MM')
  // 查询数据并返回
  await DormitoryModel.scheduleMonthList(month, ctx.auth)
})

//  -------------- 3.评优、违纪、卫生检查 查看列表 -----------------

// 评优、 违纪、 卫生检查 查看列表
// 参数 必填 type [1, 2, 3, 4] 选填 pageNo pageSize
router.post('/evaluation/list', async (ctx, next) => {
  // 获取参数
  const type = global.tools.isEnum(ctx.request.body.type, [1, 2, 3, 4], 'type参数有误')
  const pageNo = Number(ctx.request.body.pageNo) || 1
  const pageSize = Number(ctx.request.body.pageSize) || 10
  // 查询数据并返回
  await DormitoryModel.evaluationList(type, pageNo, pageSize, ctx.auth)
})

// ----------------------- 4.宿舍投诉/建议 增加 查看列表 删除 ---------------------------

// 宿舍投诉/建议 增加
// 参数 必填 type content 选填 imgList 图片短路经数组
router.post('/suggestion/add', async (ctx, next) => {
  // 获取参数
  let type = global.tools.isEnum(ctx.request.body.type, [1, 2], 'type参数有误')
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
  await DormitoryModel.suggestionAdd(type, content, imgList, userInfo)
})

// 宿舍投诉/建议 查看列表
// 参数 必填 status (0 1 2 all) 选填 pageNo pageSize
router.post('/suggestion/list', async (ctx, next) => {
  // 获取参数
  let status = global.tools.isEnum(ctx.request.body.status, [0, 1, 2, 'all'], 'status参数有误')
  const pageNo = Number(ctx.request.body.pageNo) || 1
  const pageSize = Number(ctx.request.body.pageSize) || 10
  // 查询数据并返回
  await DormitoryModel.suggestionList(status, pageNo, pageSize, ctx.auth)
})

// 宿舍投诉/建议 查看列表 删除
// 参数 必填 id
router.post('/suggestion/delete', async (ctx, next) => {
  // 获取参数
  const v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let id = await v.get('body.id')
  // 查询数据并返回
  await DormitoryModel.suggestionDelete(id, ctx.auth)
})

// ---------------------- 5.宿舍申请 增加 查看列表 删除 -------------------------
// 宿舍申请 增加
// 参数 必填 type content reason startTime endTime 
router.post('/apply/add', async (ctx, next) => {
  // 获取参数
  const v = await new ParameterValidator([{
      key: 'type',
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
      key: 'reason',
      rules: ['isLength', '参数必传', {
        min: 1
      }]
    },
    {
      key: 'startTime',
      rules: ['isLength', '参数必传', {
        min: 1
      }]
    }, {
      key: 'endTime',
      rules: ['isLength', '参数必传', {
        min: 1
      }]
    }
  ]).validate(ctx)
  let params = {
    type: await v.get('body.type'),
    content: await v.get('body.content'),
    reason: await v.get('body.reason'),
    startTime: await v.get('body.startTime'),
    endTime: await v.get('body.endTime'),
  }
  let userInfo = await CommonModel.getUserInfo(ctx.auth)
  // 查询数据并返回
  await DormitoryModel.applyAdd(params, userInfo)
})

// 宿舍申请 查看列表
// 参数 必填 status (0 1 2 3 all) 选填 pageNo pageSize
router.post('/apply/list', async (ctx, next) => {
  // 获取参数
  let status = global.tools.isEnum(ctx.request.body.status, [0, 1, 2, 3, 'all'], 'status参数有误')
  const pageNo = Number(ctx.request.body.pageNo) || 1
  const pageSize = Number(ctx.request.body.pageSize) || 10
  // 查询数据并返回
  await DormitoryModel.applyList(status, pageNo, pageSize, ctx.auth)
})

// 宿舍申请 删除
// 参数 必填 id
router.post('/apply/delete', async (ctx, next) => {
  // 获取参数
  const v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let id = await v.get('body.id')
  // 查询数据并返回
  await DormitoryModel.applyDelete(id, ctx.auth)
})

module.exports = router