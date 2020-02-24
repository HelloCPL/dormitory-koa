const path = require('path')
const fs = require('fs')
const {
  returnRandomNumber
} = require(`${process.cwd()}/app/lib/helper`)

class UploadFileModel {
  // 写入文件并返回
  static async writeFile(ctx) {
    const file = ctx.request.files.file
    // 创建可读流
    const reader = fs.createReadStream(file.path)
    let fileName = returnRandomNumber(file.name)
    let filePath = path.join(__dirname, '../../../static/public/', fileName)
    let url = global.config.servicesUrl + `public/${fileName}`
    const upStream = fs.createWriteStream(filePath)
    reader.pipe(upStream)
    return url
  }

  // 删除文件
  static async deleteFile(url) {
    let index = url.lastIndexOf('/')
    let fileName = url.substring(index + 1)
    let filePath = path.join(__dirname, '../../../static/public/', fileName)
    // 查找文件
    try {
      let stat = fs.statSync(filePath)
      if (stat.isFile()) {
        fs.unlinkSync(filePath)
      } else {
        throw new global.errs.ParameterException('文件路径错误')
      }
    } catch (e) {
      throw new global.errs.ParameterException('文件路径错误')
    }
  }
}

module.exports = UploadFileModel