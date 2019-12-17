const SerializableClass = require('../lib/serializable-class')
const expect = require('chai').expect

class RegisteredSubclass extends SerializableClass {}
SerializableClass.register(RegisteredSubclass)
class PreSerializeSubclass extends SerializableClass {
  _preSerialize (object) {
    this.value = 10
  }
}
SerializableClass.register(PreSerializeSubclass)
class PostSerializeSubclass extends SerializableClass {
  _postSerialize (object) {
    object.value = 10
  }
}
SerializableClass.register(PostSerializeSubclass)
class PreDeserializeSubclass extends SerializableClass {
  _preDeserialize (object) {
    this.value = 10
  }
}
SerializableClass.register(PreDeserializeSubclass)
class PostDeserializeSubclass extends SerializableClass {
  _postDeserialize (object) {
    this.value = 10
  }
}
SerializableClass.register(PostDeserializeSubclass)
class UnregisteredSubclass extends SerializableClass {}

describe('SerializableClass', () => {
  describe('#constructor', () => {
    it('throws an error if the subclass has not been registered', (done) => {
      expect(function () { new UnregisteredSubclass() }).to.throw('UnregisteredSubclass has not been registered as a SerializableClass')
      done()
    })
  })
  describe('#serialize', () => {
    it('serializes numbers', (done) => {
      let object = new SerializableClass()
      object.number = 0
      expect(object.serialize().number).to.equal(0)
      done()
    })
    it('serializes strings', (done) => {
      let object = new SerializableClass()
      object.string = 'string'
      expect(object.serialize().string).to.equal('string')
      done()
    })
    it('serializes objects', (done) => {
      let object = new SerializableClass()
      object.object = {number: 0}
      let serialized = object.serialize()
      expect(serialized.object).to.be.instanceof(Object)
      expect(serialized.object.number).to.equal(0)
      done()
    })
    it('serializes arrays', (done) => {
      let object = new SerializableClass()
      object.array = [0]
      let serialized = object.serialize()
      expect(serialized.array).to.be.instanceof(Array)
      expect(serialized.array[0]).to.equal(0)
      done()
    })
    it('serializes instances of SerializableClass', (done) => {
      let object = new SerializableClass()
      object.serializableObject = new SerializableClass()
      object.serializableObject.number = 0
      let serialized = object.serialize()
      expect(serialized.serializableObject._class).to.equal('SerializableClass')
      expect(serialized.serializableObject.number).to.equal(0)
      done()
    })
    it('serializes instances of subclasses of SerializableClass', (done) => {
      let subclass = new RegisteredSubclass()
      subclass.number = 0
      let serialized = subclass.serialize()
      expect(serialized._class).to.equal('RegisteredSubclass')
      expect(serialized.number).to.equal(0)
      done()
    })
    it('does not serialize functions', (done) => {
      let object = new SerializableClass()
      object.foo = function () {}
      let serialized = object.serialize()
      expect(serialized.foo).to.equal(undefined)
      done()
    })
    it('calls _preSerialize before serialization if it is defined', (done) => {
      let object = new PreSerializeSubclass()
      let serialized = object.serialize()
      expect(object.value).to.equal(10)
      expect(serialized.value).to.equal(10)
      done()
    })
    it('calls _postSerialize after serialization if it is defined', (done) => {
      let object = new PostSerializeSubclass()
      let serialized = object.serialize()
      expect(object.value).to.equal(undefined)
      expect(serialized.value).to.equal(10)
      done()
    })
  })
  describe('#deserialize', () => {
    it('deserializes numbers', (done) => {
      let object = new SerializableClass()
      object.number = 0
      let serialized = object.serialize()
      let deserialized = SerializableClass.deserialize(serialized)
      expect(deserialized.number).to.equal(0)
      done()
    })
    it('deserializes strings', (done) => {
      let object = new SerializableClass()
      object.string = 'string'
      let serialized = object.serialize()
      let deserialized = SerializableClass.deserialize(serialized)
      expect(deserialized.string).to.equal('string')
      done()
    })
    it('deserializes objects', (done) => {
      let object = new SerializableClass()
      object.object = {number: 0}
      let serialized = object.serialize()
      let deserialized = SerializableClass.deserialize(serialized)
      expect(deserialized.object).to.be.instanceof(Object)
      expect(deserialized.object.number).to.equal(0)
      done()
    })
    it('deserializes arrays', (done) => {
      let object = new SerializableClass()
      object.array = [0]
      let serialized = object.serialize()
      let deserialized = SerializableClass.deserialize(serialized)
      expect(deserialized.array).to.be.instanceof(Array)
      expect(deserialized.array[0]).to.equal(0)
      done()
    })
    it('deserializes instances of SerializableClass', (done) => {
      let object = new SerializableClass()
      object.serializableObject = new SerializableClass()
      object.serializableObject.number = 0
      let serialized = object.serialize()
      let deserialized = SerializableClass.deserialize(serialized)
      expect(deserialized.serializableObject).to.be.instanceof(SerializableClass)
      expect(deserialized.serializableObject.number).to.equal(0)
      done()
    })
    it('deserializes instances of subclasses of SerializableClass', (done) => {
      let subclass = new RegisteredSubclass()
      subclass.number = 0
      let serialized = subclass.serialize()
      let deserialized = SerializableClass.deserialize(serialized)
      expect(deserialized).to.be.instanceof(RegisteredSubclass)
      expect(deserialized.number).to.equal(0)
      done()
    })
    it('returns an instance of the class defined as the root _class', (done) => {
      let serialized = {
        _class: 'RegisteredSubclass'
      }
      let object = SerializableClass.deserialize(serialized)
      expect(object).to.be.instanceof(RegisteredSubclass)
      done()
    })
    it('throws an error if an unregistered _class is present in the root', (done) => {
      let serialized = {
        _class: 'UnregisteredClass'
      }
      expect(function () { SerializableClass.deserialize(serialized) }).to.throw('UnregisteredClass has not been registered as a SerializableClass')
      done()
    })
    it('throws an error if an unregistered _class is present in a property', (done) => {
      let serialized = {
        _class: 'SerializableClass',
        unregisteredClass: {
          _class: 'UnregisteredClass'
        }
      }
      expect(function () { SerializableClass.deserialize(serialized) }).to.throw('UnregisteredClass has not been registered as a SerializableClass')
      done()
    })
    it('calls _preDeserialize before deserialization if it is defined', (done) => {
      let serialized = {
        _class: 'PreDeserializeSubclass'
      }
      let object = SerializableClass.deserialize(serialized)
      expect(object.value).to.equal(10)
      done()
    })
    it('calls _postDeserialize after deserialization if it is defined', (done) => {
      let serialized = {
        _class: 'PostDeserializeSubclass'
      }
      let object = SerializableClass.deserialize(serialized)
      expect(object.value).to.equal(10)
      done()
    })
  })
})
