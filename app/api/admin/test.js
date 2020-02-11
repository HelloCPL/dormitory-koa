// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/admin/test'
})

router.get('/', (ctx, next) => {
  const query = ctx.request.query
  if (query.num > 1) {
    ctx.body = '成功'
  } else {
    ctx.body = '参数错误'
  }
})

module.exports = router