## 运行项目

- 初始化包 `npm i`

- 运行 `npm run dev`

## 初始化

#### 获取项目绝对路径 `process.cwd()`

#### 项目入口 app.js

#### 项目初始类 `/core/init.js`，将需要初始化的方法提取出来

- 将全局配置装载到全局

- 装载常用方法到全局

- 自动加载路由，wechat和admin

- 装载异常类到全局

- 将成功抛出异常方法的帮助方法挂载到全局

#### 全局异常处理 

- 构建常用异常类 `/core/http-exception`

- 创建全局异常类处理 `/middlewares/exception`

#### 创建参数校验方法

- 引用 `/core/utils.js` 和 `/core/lin-validator.js` 两个文件

- 然后利用 `/core/lin-validator.js` 在 `/app/validators/wechat/validators`中自定义相关参数类型校验

#### 连接mysql数据库

- 创建 `/core/db.js` 文件，利用mysql2连接数据库即可

- 操作数据库在model里面写

#### 获取wx的openid、创建和验证token

- 创建 `/app/services/wx.js` 获取openId，调用 `/app/model/wechat/register.js` 校验openId并写入数据库

- 创建 `/middlewares/wechat/auth` 设置token检验拦截，对非必要拦截路由在 `/app/api/escape` 中配置路由，同时提供根据 uid scope 生成并返回 token 方法和检测token合法性的方法，在路由自动配置前添加该中间件

- 



