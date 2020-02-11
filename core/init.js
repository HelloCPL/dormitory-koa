const path = require('path')
// 导入路由
const Router = require('koa-router')
// 导入 require-directory 自动加载路由模块文件
const requireDirectory = require('require-directory')
// 导入koa静态资源管理
const Static = require('koa-static')
// 导入token检测权限中间件
const Auth = require(`${process.cwd()}/middlewares/wechat/auth`)

class InitManager {
  // 初始化
  static init(app) {
    InitManager.app = app
    InitManager.initStatic()
    InitManager.initLoadConfig()
    InitManager.initLoadTools()
    InitManager.initLoadRouter(`${process.cwd()}/app/api/wechat`)
    InitManager.initLoadRouter(`${process.cwd()}/app/api/admin`)
    InitManager.initLoadHttpException()
    InitManager.initLoadSuccess()
  }

  // 初始化静态资源
  static initStatic() {
    // 处理公共的静态资源目录
    const pathStatic = path.join(__dirname, '../static')
    InitManager.app.use(Static(pathStatic))
    // 访问路径如  http://localhost:3000/public/bg.jpg

    // 处理需要token才能访问的静态资源目录
    // app.use(Static(path.join(__dirname, 'static', 'private')))
  }

  // 将全局配置装载到全局
  static initLoadConfig() {
    const config = require(`${process.cwd()}/config/config`)
    global.config = config
  }

  // 装载常用方法到全局
  static initLoadTools() {
    const tools = require('./tools')
    global.tools = tools
  }

  // 自动加载路由文件
  static initLoadRouter(path) {
    // 设置token检测中间件
    InitManager.app.use(new Auth().m)
    
    requireDirectory(module, path, {
      visit: loadRouterModule
    })
    // 每加载一个文件后的回调，挂载路由
    function loadRouterModule(obj) {
      if (obj instanceof Router) {
        InitManager.app.use(obj.routes())
      } else if (obj.router && obj.router instanceof Router) {
        InitManager.app.use(obj.router.routes())
      }
    }
  }

  // 装载异常类到全局
  static initLoadHttpException() {
    const errors = require('./http-exception')
    global.errs = errors
  }

  // 将成功抛出异常方法的帮助方法挂载到全局
  static initLoadSuccess() {
    const {
      success
    } = require(`${process.cwd()}/app/lib/helper`)
    global.success = success
  }
}

module.exports = InitManager