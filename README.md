# Serializable Class
`serializable-class` is a lightweight library that handles class serialization and deserialization.

---

### Installation
`npm install --save serializable-class`

### Quick Start
```javascript
const SerializableClass = require('serializable-class')
let object = new SerializableClass()
```

### Serialization
```javascript
let object = new SerializableClass()
object.value = 10
object.serialize() // { _class: 'SerializableClass', value: 10 }
```

### Deserialization
```javascript
let object = new SerializableClass()
object.value = 10
let data = object.serialize()
let deserializedObject = SerializableClass.deserialize(data) // SerializableClass { value: 10 }
```

### Extending Classes
Extending the `SerializableClass` class is easy. Just be sure to register the extended class after it has been defined.
```javascript
class Subclass extends SerializableClass {}
SerializableClass.register(Subclass)
let object = new SerializableClass()
object.subclass = new Subclass()
let data = object.serialize() // {_class: 'SerializableClass', subclass: { _class: 'Subclass' } }
let deserializedObject = SerializableClass.deserialize(data) // SerializableClass { subclass: Subclass {} }
```
It is not necessary to call `deserialize` on the extended class that you want to be returned. The class returned will always match the `_class` of the serialized object that is provided.
```javascript
class Subclass extends SerializableClass {}
SerializableClass.register(Subclass)
let object = new Subclass()
object.value = 10
let data = object.serialize() // { _class: 'Subclass', value: 10 }
let deserializedObject = SerializableClass.deserialize(data) // Subclass { value: 10}
```

### Hooks
There are four hooks available — `_preSerialize`, `_postSerialize`, `_preDeserialize`, `_postDeserialize` — which are called at the respective steps in a class's serialization and deserialization.
