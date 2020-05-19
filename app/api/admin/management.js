/**
 *                 ---------------该模块包括------------------------
 * 1.日常公告管理（ 公告 日常管理 管理规定 服务指南 安全警示 中心简介）
 *   新增 编辑 删除 查询列表 查询详情
 * 2.图片管理 （轮播 宿舍相关信息图 广告图）
 *   新增 编辑 删除 查询列表 查询详情
 *  */

// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/api/admin/management'
})

const {
  ParameterValidator
} = require(`${process.cwd()}/app/validators/validators`)
const ManagementModel = require(`${process.cwd()}/app/model/admin/management`)

// --------------- 1.日常公告管理（ 公告 日常管理 管理规定 服务指南 安全警示 中心简介） -------

// 日常公告管理 新增
// 参数 必填 startTime endTime isPublic isTop sort type title content  选填 abstract thumbnail fileUrl
router.post('/notices/add', async (ctx, next) => {
  // 获取参数并校验
  const v = await new ParameterValidator([{
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
      key: 'sort',
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
    }
  ]).validate(ctx)
  let isPublic = global.tools.isEnum(ctx.request.body.isPublic, [0, 1], 'isPublic参数有误')
  let isTop = global.tools.isEnum(ctx.request.body.isTop, [0, 1], 'isTop参数有误')
  let type = global.tools.isEnum(ctx.request.body.type, [1, 2, 3, 4, 5, 6], 'type参数有误')
  let params = {
    startTime: await v.get('body.startTime'),
    endTime: await v.get('body.endTime'),
    isPublic,
    isTop,
    sort: await v.get('body.sort'),
    type,
    title: await v.get('body.title'),
    content: await v.get('body.content'),
    abstract: await v.get('body.abstract'),
    thumbnail: await v.get('body.thumbnail'),
    fileUrl: await v.get('body.fileUrl'),
  }
  await ManagementModel.noticesAdd(params, ctx.authAdmin)
})

// 日常公告管理 编辑
// 参数 必填 id startTime endTime isPublic isTop sort type title content  选填 abstract thumbnail fileUrl
router.post('/notices/edit', async (ctx, next) => {
  // 获取参数并校验
  // 获取参数并校验
  const v = await new ParameterValidator([{
      key: 'id',
      rules: ['isLength', '参数必传，且需要为整型', {
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
      key: 'sort',
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
    }
  ]).validate(ctx)
  let isPublic = global.tools.isEnum(ctx.request.body.isPublic, [0, 1], 'isPublic参数有误')
  let isTop = global.tools.isEnum(ctx.request.body.isTop, [0, 1], 'isTop参数有误')
  let type = global.tools.isEnum(ctx.request.body.type, [1, 2, 3, 4, 5, 6], 'type参数有误')
  let params = {
    id: await v.get('body.id'),
    startTime: await v.get('body.startTime'),
    endTime: await v.get('body.endTime'),
    isPublic,
    isTop,
    sort: await v.get('body.sort'),
    type,
    title: await v.get('body.title'),
    content: await v.get('body.content'),
    abstract: await v.get('body.abstract'),
    thumbnail: await v.get('body.thumbnail'),
    fileUrl: await v.get('body.fileUrl'),
  }
  await ManagementModel.noticesEdit(params, ctx.authAdmin)

})

// 日常公告管理 删除
// 参数 必填 ids
router.post('/notices/delete', async (ctx, next) => {
  // 获取参数并校验
  let v = await new ParameterValidator([{
    key: 'ids',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let ids = await v.get('body.ids')
  await ManagementModel.noticesDelete(ids)
})

// 日常公告管理 查询列表
// 参数 选填 keyword timeStatus(1 正在展示 2 未开始 0 已过期) isPublic isTop type pageNo pageSize
router.post('/notices/list', async (ctx, next) => {
  // 获取参数并校验
  let pageNo = Number(ctx.request.body.pageNo) || 1
  let pageSize = Number(ctx.request.body.pageSize) || 10
  let params = {
    pageNo,
    pageSize,
    keyword: ctx.request.body.keyword,
    timeStatus: ctx.request.body.timeStatus,
    isPublic: ctx.request.body.isPublic,
    isTop: ctx.request.body.isTop,
    type: ctx.request.body.type
  }
  await ManagementModel.noticesList(params)
})

// 日常公告管理 查询详情
// 参数 必填 id
router.post('/notices/detail', async (ctx, next) => {
  // 获取参数并校验
  let v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let id = await v.get('body.id')
  await ManagementModel.noticesDetail(id)
})

// --------------- 2.图片管理 （轮播 宿舍相关信息图 广告图） -------

// 图片管理 新增
// 参数 必填 startTime endTime isPublic isTop sort type url  选填 desc remark
router.post('/images/add', async (ctx, next) => {
  // 获取参数并校验
  const v = await new ParameterValidator([{
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
      key: 'sort',
      rules: ['isInt', '参数必传，且需要为整型', {
        min: 1
      }]
    },
    {
      key: 'url',
      rules: ['isLength', '参数必传', {
        min: 1
      }]
    }
  ]).validate(ctx)
  let isPublic = global.tools.isEnum(ctx.request.body.isPublic, [0, 1], 'isPublic参数有误')
  let isTop = global.tools.isEnum(ctx.request.body.isTop, [0, 1], 'isTop参数有误')
  let type = global.tools.isEnum(ctx.request.body.type, [1, 2, 3, 4], 'type参数有误')
  let params = {
    startTime: await v.get('body.startTime'),
    endTime: await v.get('body.endTime'),
    isPublic,
    isTop,
    sort: await v.get('body.sort'),
    type,
    url: await v.get('body.url'),
    desc: await v.get('body.desc'),
    remark: await v.get('body.remark')
  }
  await ManagementModel.imagesAdd(params, ctx.authAdmin)
})

// 图片管理 编辑
// 参数 必填 id startTime endTime isPublic isTop sort type url  选填 desc remark
router.post('/images/edit', async (ctx, next) => {
  // 获取参数并校验
  const v = await new ParameterValidator([{
      key: 'id',
      rules: ['isLength', '参数必传，且需要为整型', {
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
      key: 'sort',
      rules: ['isInt', '参数必传，且需要为整型', {
        min: 1
      }]
    },
    {
      key: 'url',
      rules: ['isLength', '参数必传', {
        min: 1
      }]
    }
  ]).validate(ctx)
  let isPublic = global.tools.isEnum(ctx.request.body.isPublic, [0, 1], 'isPublic参数有误')
  let isTop = global.tools.isEnum(ctx.request.body.isTop, [0, 1], 'isTop参数有误')
  let type = global.tools.isEnum(ctx.request.body.type, [1, 2, 3, 4], 'type参数有误')
  let params = {
    id: await v.get('body.id'),
    startTime: await v.get('body.startTime'),
    endTime: await v.get('body.endTime'),
    isPublic,
    isTop,
    sort: await v.get('body.sort'),
    type,
    url: await v.get('body.url'),
    desc: await v.get('body.desc'),
    remark: await v.get('body.remark')
  }
  await ManagementModel.imagesEdit(params, ctx.authAdmin)
})

// 图片管理 删除
// 参数 必填 ids
router.post('/images/delete', async (ctx, next) => {
  // 获取参数并校验
  let v = await new ParameterValidator([{
    key: 'ids',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let ids = await v.get('body.ids')
  await ManagementModel.imagesDelete(ids)
})

// 图片管理 查询列表
// 参数 选填 keyword timeStatus(1 正在展示 1 未开始 0 已过期) isPublic isTop type pageNo pageSize
router.post('/images/list', async (ctx, next) => {
  // 获取参数并校验
  let pageNo = Number(ctx.request.body.pageNo) || 1
  let pageSize = Number(ctx.request.body.pageSize) || 10
  let params = {
    pageNo,
    pageSize,
    keyword: ctx.request.body.keyword,
    timeStatus: ctx.request.body.timeStatus,
    isPublic: ctx.request.body.isPublic,
    isTop: ctx.request.body.isTop,
    type: ctx.request.body.type
  }
  await ManagementModel.imagesList(params)
})

// 图片管理 查询详情
// 参数 必填 id
router.post('/images/detail', async (ctx, next) => {
  // 获取参数并校验
  let v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let id = await v.get('body.id')
  await ManagementModel.imagesDetail(id)
})

module.exports = router