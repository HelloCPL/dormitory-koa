/**
 *                 --------------- 通用模块包括 --------------------
 * 1.评价 增加 删除
 * 
 *  */

// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/api/wechat/common'
})

const {
  ParameterValidator
} = require(`${process.cwd()}/app/validators/validators`)
const CommonModel = require(`${process.cwd()}/app/model/wechat/common`)

// ---------------------- 1. 评价 增加 删除 --------------------

// 评价 增加
// 参数 必填 keyId type scope content 选填 remark
router.post('/evaluation/add', async (ctx, next) => {
  // 获取参数
  const v = await new ParameterValidator([{
      key: 'keyId',
      rules: ['isLength', '参数必传', {
        min: 1
      }]
    }, {
      key: 'type',
      rules: ['isLength', '参数必传', {
        min: 1
      }]
    },
    {
      key: 'scope',
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
  let params = {
    keyId: await v.get('body.keyId'),
    type: await v.get('body.type'),
    scope: await v.get('body.scope'),
    content: await v.get('body.content'),
    remark: await v.get('body.remark'),
  }
  await CommonModel.evaluationAdd(params, ctx.auth)
})

// 评价 删除
// 参数 必填 id
router.post('/evaluation/delete', async (ctx, next) => {
  // 获取参数
  const v = await new ParameterValidator([{
    key: 'id',
    rules: ['isLength', '参数必传', {
      min: 1
    }]
  }]).validate(ctx)
  let id = await v.get('body.id')
  // 查询数据并返回
  await CommonModel.evaluationDelete(id, ctx.auth)
})

module.exports = router