// 导入路由
const path = require('path')
const Router = require('koa-router')
const router = new Router({
  prefix: '/api'
})
const ueditor = require('koa2-ueditor')

router.all('/ueditor/upload', ueditor(path.join(__dirname, '../../static/ueimages/')))

module.exports = router