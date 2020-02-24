// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/api/wechat/test'
})

router.get('/', (ctx, next) => {
  global.success({
    data: [{
      username: 'zhangsan',
      age: 1212
    }, {
      username: 'lisi',
      age: 123123
    }],
    total: 1
  })
})

router.post('/', (ctx, next) => {
  global.success({
    data: [{
      username: 'zhangsan',
      age: 1212
    }, {
      username: 'lisi',
      age: 123123
    }],
    total: 1
  })
})

module.exports = router