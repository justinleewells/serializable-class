# Serializable Object 
`serializable-object` is a lightweight library that handles object serialization and deserialization.

---

### Installation
`npm install --save serializable-object`

### Quick Start
```javascript
const SerializableObject = require('serializable-object')
let object = new SerializableObject()
```

### Serialization
```javascript
let object = new SerializableObject()
object.value = 10
object.serialize() // { _class: 'SerializableObject', value: 10 }
```

### Deserialization
```javascript
let object = new SerializableObject()
object.value = 10
let data = object.serialize()
let deserializedObject = SerializableObject.deserialize(data) // SerializableObject { value: 10 }
```

### Extending Classes
Extending the `SerializableObject` class is easy. Just be sure to register the extended class after it has been defined.
```javascript
class Subclass extends SerializableObject {}
SerializableObject.register(Subclass)
let object = new SerializableObject()
object.subclass = new Subclass()
let data = object.serialize() // {_class: 'SerializableObject', subclass: { _class: 'Subclass' } }
let deserializedObject = SerializableObject.deserialize(data) // SerializableObject { subclass: Subclass {} }
```
It is not necessary to call `deserialize` on the extended class that you want to be returned. The class returned will always match the `_class` of the serialized object that is provided.
```javascript
class Subclass extends SerializableObject {}
SerializableObject.register(Subclass)
let object = new Subclass()
object.value = 10
let data = object.serialize() // { _class: 'Subclass', value: 10 }
let deserializedObject = SerializableObject.deserialize(data) // Subclass { value: 10}
```

### Hooks
There are four hooks available — `_preSerialize`, `_postSerialize`, `_preDeserialize`, `_postDeserialize` — which are called at the respective steps in a class's serialization and deserialization.
