const SerializableObject = require('../lib/serializable-object')
const expect = require('chai').expect

class RegisteredSubclass extends SerializableObject {}
SerializableObject.register(RegisteredSubclass)
class DeserializeHookSubclass extends SerializableObject {
  _deserialize (object) {
    this.value = 10
  }
}
SerializableObject.register(DeserializeHookSubclass)
class UnregisteredSubclass extends SerializableObject {}

describe('SerializableObject', () => {
  describe('#constructor', () => {
    it('throws an error if the subclass has not been registered', (done) => {
      expect(function () { new UnregisteredSubclass() }).to.throw('UnregisteredSubclass has not been registered as a SerializableObject')
      done()
    })
  })
  describe('#serialize', () => {
    it('serializes numbers', (done) => {
      let object = new SerializableObject()
      object.number = 0
      expect(object.serialize().number).to.equal(0)
      done()
    })
    it('serializes strings', (done) => {
      let object = new SerializableObject()
      object.string = 'string'
      expect(object.serialize().string).to.equal('string')
      done()
    })
    it('serializes objects', (done) => {
      let object = new SerializableObject()
      object.object = {number: 0}
      let serialized = object.serialize()
      expect(serialized.object).to.be.instanceof(Object)
      expect(serialized.object.number).to.equal(0)
      done()
    })
    it('serializes arrays', (done) => {
      let object = new SerializableObject()
      object.array = [0]
      let serialized = object.serialize()
      expect(serialized.array).to.be.instanceof(Array)
      expect(serialized.array[0]).to.equal(0)
      done()
    })
    it('serializes instances of SerializableObject', (done) => {
      let object = new SerializableObject()
      object.serializableObject = new SerializableObject()
      object.serializableObject.number = 0
      let serialized = object.serialize()
      expect(serialized.serializableObject._class).to.equal('SerializableObject')
      expect(serialized.serializableObject.number).to.equal(0)
      done()
    })
    it('serializes instances of subclasses of SerializableObject', (done) => {
      let subclass = new RegisteredSubclass()
      subclass.number = 0
      let serialized = subclass.serialize()
      expect(serialized._class).to.equal('RegisteredSubclass')
      expect(serialized.number).to.equal(0)
      done()
    })
    it('does not serialize functions', (done) => {
      let object = new SerializableObject()
      object.foo = function () {}
      let serialized = object.serialize()
      expect(serialized.foo).to.equal(undefined)
      done()
    })
  })
  describe('#deserialize', () => {
    it('deserializes numbers', (done) => {
      let object = new SerializableObject()
      object.number = 0
      let serialized = object.serialize()
      let deserialized = new SerializableObject().deserialize(serialized)
      expect(deserialized.number).to.equal(0)
      done()
    })
    it('deserializes strings', (done) => {
      let object = new SerializableObject()
      object.string = 'string'
      let serialized = object.serialize()
      let deserialized = new SerializableObject().deserialize(serialized)
      expect(deserialized.string).to.equal('string')
      done()
    })
    it('deserializes objects', (done) => {
      let object = new SerializableObject()
      object.object = {number: 0}
      let serialized = object.serialize()
      let deserialized = new SerializableObject().deserialize(serialized)
      expect(deserialized.object).to.be.instanceof(Object)
      expect(deserialized.object.number).to.equal(0)
      done()
    })
    it('deserializes arrays', (done) => {
      let object = new SerializableObject()
      object.array = [0]
      let serialized = object.serialize()
      let deserialized = new SerializableObject().deserialize(serialized)
      expect(deserialized.array).to.be.instanceof(Array)
      expect(deserialized.array[0]).to.equal(0)
      done()
    })
    it('deserializes instances of SerializableObject', (done) => {
      let object = new SerializableObject()
      object.serializableObject = new SerializableObject()
      object.serializableObject.number = 0
      let serialized = object.serialize()
      let deserialized = new SerializableObject().deserialize(serialized)
      expect(deserialized.serializableObject).to.be.instanceof(SerializableObject)
      expect(deserialized.serializableObject.number).to.equal(0)
      done()
    })
    it('deserializes instances of subclasses of SerializableObject', (done) => {
      let subclass = new RegisteredSubclass()
      subclass.number = 0
      let serialized = subclass.serialize()
      let deserialized = new RegisteredSubclass().deserialize(serialized)
      expect(deserialized).to.be.instanceof(RegisteredSubclass)
      expect(deserialized.number).to.equal(0)
      done()
    })
    it('returns an instance of the class defined as the root _class', (done) => {
      let serialized = {
        _class: 'RegisteredSubclass'
      }
      let object = new SerializableObject().deserialize(serialized)
      expect(object).to.be.instanceof(RegisteredSubclass)
      done()
    })
    it('throws an error if an unregistered _class is present in the root', (done) => {
      let serialized = {
        _class: 'UnregisteredClass'
      }
      expect(function () { new SerializableObject().deserialize(serialized) }).to.throw('UnregisteredClass has not been registered as a SerializableObject')
      done()
    })
    it('throws an error if an unregistered _class is present in a property', (done) => {
      let serialized = {
        _class: 'SerializableObject',
        unregisteredClass: {
          _class: 'UnregisteredClass'
        }
      }
      expect(function () { new SerializableObject().deserialize(serialized) }).to.throw('UnregisteredClass has not been registered as a SerializableObject')
      done()
    })
    it('calls _deserialize after deserialization if it is defined', (done) => {
      let serialized = {
        _class: 'DeserializeHookSubclass'
      }
      let object = new SerializableObject().deserialize(serialized)
      expect(object.value).to.equal(10)
      done()
    })
  })
})
