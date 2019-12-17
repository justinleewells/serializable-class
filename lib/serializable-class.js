const serializeArray = Symbol('serializeArray')
const serializeObject = Symbol('serializeObject')
const serializeValue = Symbol('serializeValue')

const deserializeArray = Symbol('deserializeArray')
const deserializeObject = Symbol('deserializeObject')
const deserializeValue = Symbol('deserializeValue')

const throwUnregisteredError = (name) => { throw new Error(`${name} has not been registered as a SerializableClass`) }

class SerializableClass {
  static register(cls) {
    classMap[cls.name] = cls
  }
  static deserialize (object) {
    if (object._class == undefined) {
      throw new Error(`_class is undefined`)
    }
    if (classMap[object._class] == undefined) {
      throwUnregisteredError(object._class)
    }
    let result = new classMap[object._class]()
    if (result._preDeserialize) result._preDeserialize(object)
    Object.assign(
      result,
      this[deserializeObject](object)
    )
    if (result._postDeserialize) result._postDeserialize(object)
    return result
  }
  static [deserializeArray] (array) {
    return array.map(value => this[deserializeValue](value))
  }
  static [deserializeObject] (object) {
    return Object.entries(object).reduce((result, [key, value]) => {
      if (key != '_class') result[key] = this[deserializeValue](value)
      return result
    }, {})
  }
  static [deserializeValue] (value) {
    if (value instanceof Array) {
      return this[deserializeArray](value)
    }
    else if (value instanceof Object) {
      if (value._class != undefined) {
        if (classMap[value._class] == undefined) throwUnregisteredError(value._class)
        return this.deserialize(value)
      }
      else {
        return this[deserializeObject](value)
      }
    }
    else return value
  }
  constructor () {
    let name = this.constructor.name
    if (classMap[name] == undefined) throwUnregisteredError(name)
  }
  serialize () {
    if (this._preSerialize) this._preSerialize()
    let result = Object.assign(
      this[serializeObject](this),
      {
        _class: this.constructor.name
      }
    )
    if (this._postSerialize) this._postSerialize(result)
    return result
  }
  [serializeArray] (array) {
    return array.map(value => this[serializeValue](value))
  }
  [serializeObject] (object) {
    return Object.entries(object).reduce((result, [key, value]) => {
      if (!(object[key] instanceof Function)) result[key] = this[serializeValue](value)
      return result
    }, {})
  }
  [serializeValue] (value) {
    if (value instanceof SerializableClass) {
      return value.serialize()
    }
    else if (value instanceof Array) {
      return this[serializeArray](value)
    }
    else if (value instanceof Object) {
      return this[serializeObject](value)
    }
    else return value
  }
}

let classMap = {
  SerializableClass: SerializableClass
}

module.exports = SerializableClass
