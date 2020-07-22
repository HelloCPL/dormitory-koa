// 使用 https
const http = require('http')
const https = require('https')
const ssilfy = require('koa-sslify').default

const fs = require('fs')
const options = {
  key: fs.readFileSync('./httpskey/privatekey.pem'),
  cert: fs.readFileSync('./httpskey/certificate.pem')
}

// 导入koa
const Koa = require('koa')
// 导入koa-bodyparser处理body参数
// const Parser = require('koa-bodyparser')
// 导入文件上传插件 注使用koa-body 就不需要使用koa-bodyparser
const koaBody = require('koa-body')
// 导入初始化类
const InitManger = require('./core/init')
// 导入自定义全局异常处理
const catchError = require('./middlewares/exception')

const app = new Koa()

// 使用ssl
app.use(ssilfy())

// 跨域处理
const cors = require('koa2-cors')
app.use(cors())
// app.use(async (ctx, next) => {
//   ctx.set('Access-Control-Allow-Origin', '*'); // 很奇怪的是，使用 * 会出现一些其他问题
//   ctx.set('Access-Control-Allow-Headers', 'content-type');
//   ctx.set('Access-Control-Allow-Methods', 'OPTIONS,GET,HEAD,PUT,POST,DELETE,PATCH')
//   if (ctx.method == 'OPTIONS') {
//     ctx.body = 200
//   }
//   await next()
// });

// 全局处理异常
app.use(catchError)
// 处理body参数中间件
// app.use(Parser())
// 处理文件上传中间件，同时会处理body参数
app.use(koaBody({
  multipart: true,
  formidable: {
    maxFieldsSize: 20 * 1024 * 1024 // 设置上传文件大小最大限制，默认2M
  }
}))

// 初始化，设置静态资源托管，自动加载路由，添加全局变量等
InitManger.init(app)
// 设置监听
// app.listen(global.config.port, () => {
//   console.log('service running...')
// })

// 设置 http 监听
http.createServer(app.callback()).listen(global.config.port, () => {
  console.log(`Http Service(${global.config.port}) Running...`)
})
  
// 设置 https 监听
https.createServer(options, app.callback()).listen(global.config.httpsPort, function () {
  console.log(`Https Service(${global.config.httpsPort}) Running...`)
})