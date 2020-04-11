// js常用方法
// 常用方法
const self = {
  // 判断是否是一个字符串
  isString(str) {
    return toString.call(str) === "[object String]";
  },

  // 判断是否是一个数字（包括NaN）
  isNumber(num) {
    return toString.call(num) === "[object Number]";
  },

  // 判断是否是 NaN
  isNaN(num) {
    return toString.call(num) === "[object Number]" && isNaN(num);
  },

  // 判断是否是一个Boolean
  isBoolean(bool) {
    return bool === true || bool === false || toString.call(bool) === "[object Boolean]";
  },

  // 判断是否是null
  isNull(nul) {
    return nul === null;
  },

  // 判断是否是undefined
  isUndefined(und) {
    return und === undefined;
  },

  // 判断是否是一个空对象
  isEmptyObject(obj) {
    return typeof obj === "object" && !!obj && JSON.stringify(obj) === "{}";
  },

  // 判断是否是一个对象（包括空对象）
  isObject(obj) {
    return typeof obj === "object" && !!obj && toString.call(obj) !== "[object Array]";
  },

  // 判断是否是一个空数组
  isEmptyArray(arr) {
    return toString.call(arr) === "[object Array]" && JSON.stringify(arr) === "[]";
  },

  // 判断是否是一个数组
  isArray(arr) {
    return toString.call(arr) === "[object Array]" || Array.isArray(arr) || arr instanceof Array;
  },

  // 判断是否是函数
  isFunction(func) {
    return toString.call(func) === "[object Function]";
  },

  // 判断是否是一个日期
  isDate(date) {
    return toString.call(date) === "[object Date]";
  },

  // 判断是否是一个正则表达式
  isRegExp(reg) {
    return toString.call(reg) === "[object RegExp]";
  },

  // 对象或数组浅拷贝,只复制第一层属性或方法
  simpleCopy(obj) {
    let obj2 = Array.isArray(obj) ? [] : {};
    if (obj && typeof obj === "object") {
      for (let i in obj) {
        obj2[i] = obj[i];
      }
      return obj2;
    } else {
      return obj;
    }
  },

  // 对象或数组深拷贝
  deepCopy(obj) {
    let obj2 = Array.isArray(obj) ? [] : {};
    if (obj && typeof obj === "object") {
      for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
          // 如果是引用类型，递归复制
          if (obj[i] && typeof obj[i] === "object") {
            obj2[i] = self.deepCopy(obj[i]);
          } else {
            // 如果是基本数据类型，只是简单的复制
            obj2[i] = obj[i];
          }
        }
      }
      return obj2;
    } else {
      return obj;
    }
  },

  // 数组排序（非数组返回 []，对象数组不指定key返回原数组）
  // 参数一：排序数组；
  // 参数二：排序方式（升序、默认，desc降序，random随机排序）；
  // 参数三：当数组是对象数组时，传入对象要排序的key属性
  sort(array, sort = 'asce', key = null) {
    if (!self.isArray(array)) return [];
    let arr = self.deepCopy(array);
    switch (sort) {
      case "desc":
        if (key && self.isObject(array[0])) {
          return arr.sort(function (a, b) {
            let x = a[key],
              y = b[key];
            if (x < y) return 1;
            if (x > y) return -1;
            return 0;
          });
        } else {
          return arr.sort(function (a, b) {
            if (a < b) return 1;
            if (a > b) return -1;
            return 0;
          });
        }
        case "random":
          if (key && self.isObject(array[0])) {
            return arr.sort(function (a, b) {
              let x = a[key],
                y = b[key];
              return 0.5 - Math.random();
            });
          } else {
            return arr.sort(function (a, b) {
              return 0.5 - Math.random();
            });
          }

          default:
            if (key && self.isObject(array[0])) {
              return arr.sort(function (a, b) {
                let m = a[key],
                  n = b[key];
                if (m < n) return -1;
                if (m > n) return 1;
                return 0;
              });
            } else {
              return arr.sort(function (a, b) {
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
              });
            }
    }
  },

  // 转化为数字（非数字返回 NaN）
  toNumber(num) {
    if (self.isNumber(num) || self.isString(num)) {
      num = parseFloat(num) * 1;
      return num;
    }
    return NaN;
  },

  // 指定日期格式（传入毫秒值或时间格式，否则返回空）
  //   参数一：指定时间；参数二：指定格式，如 'YYYY-MM-DD hh:mm:ss day'
  dateFormat(value, format) {
    if (!(self.isDate(value) || (self.isNumber(value) && !self.isNaN(value)) || self.isString(
        value)))
      return "";
    if (self.isString(value)) {
      value = value.replace(/-/gi, '/')
      let val = Number(value);
      if (self.isNumber(val) && !self.isNaN(val)) {
        value = val;
      }
    }
    let date;
    try {
      date = new Date(value);
    } catch (e) {
      return "";
    }
    if (date == "Invalid Date") return "";
    // if (!value) return ''
    // let date = new Date(value)
    format = format || "YYYY-MM-DD hh:mm:ss";
    let days = ["日", "一", "二", "三", "四", "五", "六"];
    let year = date.getFullYear();
    let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    let dateData = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    let day = days[date.getDay()];
    format = format.replace(/(YYYY)|(yyyy)/, year);
    format = format.replace(/(MM)/, month);
    format = format.replace(/(DD)|(dd)/, dateData);
    format = format.replace(/(HH)|(hh)/, hours);
    format = format.replace(/(mm)/, minutes);
    format = format.replace(/(SS)|(ss)/, seconds);
    format = format.replace(/(DAY)|(day)/, day);
    return format;
  },

  //  加法精度问题（可传多个，传入数值或字符串数值，否则返回 空字符串 ''）
  accAdd(...argument) {
    let max = 0,
      count = 0,
      len = argument.length;
    // 遍历寻找最大小数位以及校验是否为合法数值
    for (let i = 0; i < len; i++) {
      let item = argument[i],
        len2;
      item = self.toNumber(item);
      if (!(self.isNumber(item) && !self.isNaN(item))) return "";
      try {
        len2 = item.toString().split(".")[1].length;
      } catch (e) {
        len2 = 0;
      }
      max = max >= len2 ? max : len2;
    }
    max = Math.pow(10, max);
    for (let i = 0; i < len; i++) {
      count += argument[i] * max;
    }
    return count / max;
  },

  //  减法精度问题（可传多个，数值或字符串数值，否则返回空字符串 ''）
  accSub(...argument) {
    let max = 0,
      len = argument.length;
    if (!len) return "";
    let count = argument[0];
    // 遍历寻找最大小数位以及校验是否为合法数值
    for (let i = 0; i < len; i++) {
      let item = argument[i],
        len2;
      item = self.toNumber(item);
      if (!(self.isNumber(item) && !self.isNaN(item))) return "";
      try {
        len2 = item.toString().split(".")[1].length;
      } catch (e) {
        len2 = 0;
      }
      max = max >= len2 ? max : len2;
    }
    max = Math.pow(10, max);
    count = count * max;
    for (let i = 1; i < len; i++) {
      count -= argument[i] * max;
    }
    return count / max;
  },

  //  乘法精度问题（只传两个，数值或字符串数值，否则返回空字符串 ''）
  accMul(num1, num2) {
    let count,
      len = 0;
    num1 = self.toNumber(num1);
    num2 = self.toNumber(num2);
    if (!(self.isNumber(num1) && !self.isNaN(num1) && self.isNumber(num2) && !self.isNaN(num2)))
      return "";
    num1 = num1.toString();
    num2 = num2.toString();
    try {
      len += num1.split(".")[1].length;
    } catch (e) {
      len += 0;
    }
    try {
      len += num2.split(".")[1].length;
    } catch (e) {
      len += 0;
    }
    count = (Number(num1.replace(".", "")) * Number(num2.replace(".", ""))) / Math.pow(10, len);
    return count;
  },

  // 除法精度问题（只传两个，数值或字符串数值，否则返回空字符串 ''）
  accDiv(num1, num2) {
    let divisionCount, divisionedCount, len1, len2;
    num1 = self.toNumber(num1);
    num2 = self.toNumber(num2);
    if (!(
        self.isNumber(num1) &&
        !self.isNaN(num1) &&
        self.isNumber(num2) &&
        !self.isNaN(num2) &&
        num2 !== 0
      ))
      return "";
    num1 = num1.toString();
    num2 = num2.toString();
    try {
      len1 = num1.split(".")[1].length;
    } catch (e) {
      len1 = 0;
    }
    try {
      len2 = num2.split(".")[1].length;
    } catch (e) {
      len2 = 0;
    }
    divisionCount = Number(num1.replace(".", "")) / Number(num2.replace(".", ""));
    divisionedCount = Math.pow(10, len2 - len1);
    return self.accMul(divisionCount, divisionedCount);
  },

  // 将科学计数法展开（输入数值或字符串数值，返回展开后的数值字符串，否则返回空字符串）
  toNonExponential(num) {
    num = self.toNumber(num);
    if (self.isNumber(num) && !self.isNaN(num)) {
      let m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
      return num.toFixed(Math.max(0, (m[1] || "").length - m[2]));
    }
    return "";
  },

  // 返回当前时间戳
  getTimeValue() {
    let now = new Date()
    return now.valueOf()
  },

  // 判断是否是一个对象，是 返回 否 抛出异常
  judgeObject(obj, err = '参数有误') {
    let flag = (typeof obj === "object" && !!obj && toString.call(obj) !== "[object Array]") && JSON.stringify(obj) !== "{}"
    if (flag) {
      return obj
    } else {
      throw new global.errs.ParameterException(err)
    }
  },

  // 判断是否是一个数组，是 返回 否 抛出异常
  judgeArray(arr, err = '参数有误') {
    let flag = (toString.call(arr) === "[object Array]" || Array.isArray(arr) || arr instanceof Array) && JSON.stringify(arr) !== "[]"
    if (flag) {
      return arr
    } else {
      throw new global.errs.ParameterException(err)
    }
  },

  // 枚举 是否是数组中的值，是 返回值 否 抛出异常
  isEnum(value, arr, err = '参数有误') {
    arr = self.judgeArray(arr, '服务器发生异常，枚觉发生错误')
    if (arr.indexOf(value) != -1) {
      return value
    } else {
      throw new global.errs.ParameterException(err)
    }
  },

  // 参数一 是否 小于 参数二
  isLessThan(min, max, err = '参数有误') {
    try {
      min = parseInt(min)
      max = parseInt(max)
      if (min > max) {
        throw new global.errs.ParameterException(err)
      }
    } catch (e) {
      throw new global.errs.ParameterException(err)
    }
  },

  // 格式化文件大小 传入的文件单位为 字节 B
  formatFileSize(fileSize) {
    if (!fileSize && fileSize != 0) return ''
    try {
      let size1 = parseFloat((fileSize / 1024 / 1024).toFixed(2))
      let size2 = parseFloat((fileSize / 1024).toFixed(2))
      if (size1 >= 1) {
        return size1 + 'M'
      } else if (size2 >= 1) {
        return size2 + 'KB'
      } else {
        return parseInt(fileSize) + 'B'
      }
    } catch (e) {
      return fileSize
    }
  }

};

module.exports = self