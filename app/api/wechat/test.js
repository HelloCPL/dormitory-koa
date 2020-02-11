// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/wechat/test'
})

router.get('/', (ctx, next) => {
  const query = ctx.request.query
  if (query.num > 1) {
    throw global.success({
      data: [{
        username: 'zhangsan',
        age: 1212
      }, {
        username: 'lisi',
        age: 123123
      }],
      total: 1
    })
  } else {
    throw new global.errs.ParameterException()
  }
})

module.exports = router