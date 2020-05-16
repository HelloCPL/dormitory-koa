// 导入路由
const Router = require('koa-router')
const router = new Router({
  prefix: '/api/wechat/file'
})

const UploadFileModel = require(`${process.cwd()}/app/model/uploadFile`)

// 上传单个文件
router.post('/upload', async (ctx, next) => {
  // 读取写入文件返回文件路径
  const url = await UploadFileModel.writeFile(ctx)
  global.success({
    data: url
  })
})

// 删除单个文件
router.get('/delete', async (ctx, next) => {
  // 获取删除文件地址
  const v = await new global.ParameterValidator({
    key: 'url',
    rules: ['isLength', '参数必填', {
      min: 1
    }]
  }).validate(ctx)
  // 删除文件
  await UploadFileModel.deleteFile(await v.get('query.url'))
  global.success()
})

module.exports = router