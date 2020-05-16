const path = require('path')
const fs = require('fs')
const {
  returnRandomNumber,
  returnRandomFile
} = require(`${process.cwd()}/app/lib/helper`)

class UploadFileModel {
  // 写入文件并返回
  static async writeFile(ctx) {
    const file = ctx.request.files.file
    // 创建可读流
    const reader = fs.createReadStream(file.path)
    let fileName = returnRandomNumber(file.name)
    let filePath = path.join(__dirname, '../../static/images/', fileName)
    let url = global.config.servicesUrl + `images/${fileName}`
    const upStream = fs.createWriteStream(filePath)
    reader.pipe(upStream)
    return {
      shortName: fileName,
      fullName: url
    }
  }

  // 删除文件
  static async deleteFile(shortName) {
    let filePath = path.join(__dirname, '../../static/images/', shortName)
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

  // 写入文件并返回
  static async writeFileFull(ctx) {
    const file = ctx.request.files.file
    // 创建可读流
    const reader = fs.createReadStream(file.path)
    let fileName = returnRandomFile(file.name)
    let fileSize = file.size
    let fileSizeWord = getSizeWord(fileSize)
    let filePath = path.join(__dirname, '../../static/files/', fileName)
    let url = global.config.servicesUrl + `files/${fileName}`
    const upStream = fs.createWriteStream(filePath)
    reader.pipe(upStream)
    return {
      fileSize: fileSize,
      fileSizeWord: fileSizeWord,
      shortName: fileName,
      fullName: url
    }
  }

  // 删除文件
  static async deleteFileFull(shortName) {
    let filePath = path.join(__dirname, '../../static/files/', shortName)
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

function getSizeWord(size) {
  try {
    let size1 = size / 1024 / 1024
    let size2 = size / 1024
    if (size1 >= 1) {
      return size1.toFixed(2) + 'M'
    } else if (size2 >= 1) {
      return size2.toFixed(2) + 'KB'
    } else {
      return parseInt(size) + 'B'
    }
  } catch (e) {
    return 0
  }
}

module.exports = UploadFileModel