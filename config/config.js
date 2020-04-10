module.exports = {
  environment: 'dev', // prod 为生产环境 dev 为开发环境
  port: 3000, // 启动端口号
  database: { // 数据库参数配置
    dbName: 'dormitory',
    user: 'root',
    password: 'root',
    host: 'localhost',
    port: 3306,
    connectionLimit: 500
  },
  securityWechat: { // 小程序token配置
    secretKey: 'wechat',
    expiresIn: 60 * 60 * 2 // 有效时间默认 2小时
  },
  securityAdmin: { // PC端token配置
    secretKey: 'admin',
    expiresIn: 60 * 60 * 2
  },
  wx: {
    appId: 'wx15b4165798ef239f',
    appSecret: 'e6f25f907790b77055c731eae3fdc36e',
    loginUrl: 'https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code'
  },
  servicesUrl: 'http://localhost:3000/', //服务器请求前缀，用于静态资源的请求
}