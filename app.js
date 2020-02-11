// 导入koa
const Koa = require('koa')
// 导入koa-bodyparser处理body参数
const Parser = require('koa-bodyparser')
// 导入初始化类
const InitManger = require('./core/init')
// 导入自定义全局异常处理
const catchError = require('./middlewares/exception')

const app = new Koa()

// 全局处理异常
app.use(catchError)
// 处理body参数中间件
app.use(Parser())

// 初始化，设置静态资源托管，自动加载路由，添加全局变量等
InitManger.init(app)

// 设置监听
app.listen(global.config.port)