
// 创建遍历寻找成员方法
const findMembers = (instance, {
  prefix, // 前缀
  specifiedType, //指定类型
  filter // 过滤方法
}) => {
  function _find(instance) {
    // 跳出递归
    if (instance.__proto__ === null) return []
    // 计算属性个数
    let names = Reflect.ownKeys(instance)
    // 过滤掉不满足条件的属性或方法名
    names = names.filter(name => {
      return _shouldKeep(name)
    })

    // 递归调用，知道找出所有属性
    return [...names, ..._find(instance.__proto__)]
  }

  // 过滤条件
  function _shouldKeep(value) {
    if (filter)
      if (filter(value)) return true

    if (prefix)
      if (value.startsWith(prefix)) return true

    if (specifiedType)
      if (instance[value] instanceof specifiedType) return true
  }

  // 调用
  return _find(instance)
}

module.exports = {
  findMembers
}