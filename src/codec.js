// This file is auto generated by the protocol-buffers compiler

/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable no-redeclare */
/* eslint-disable camelcase */

// Remember to `npm install --save protocol-buffers-encodings`
var encodings = require('protocol-buffers-encodings')
var varint = encodings.varint
var skip = encodings.skip

exports.PartType = {
  Beam: 0,
  Skin: 1,
  Fastener: 2,
  Accessory: 3,
  Adapter: 4
}

exports.SpecId = {
  og: 0
}

exports.SizeId = {
  '1.5in': 0,
  '1in': 1,
  '2in': 2,
  '25mm': 3,
  '40mm': 4,
  '50mm': 5
}

exports.MaterialId = {
  Wood: 0,
  Aluminum: 1,
  Steel: 2
}

var Direction = (exports.Direction = {
  buffer: true,
  encodingLength: null,
  encode: null,
  decode: null
})

var GridPosition = (exports.GridPosition = {
  buffer: true,
  encodingLength: null,
  encode: null,
  decode: null
})

var Part = (exports.Part = {
  buffer: true,
  encodingLength: null,
  encode: null,
  decode: null
})

var Model = (exports.Model = {
  buffer: true,
  encodingLength: null,
  encode: null,
  decode: null
})

defineDirection()
defineGridPosition()
definePart()
defineModel()

function defineDirection () {
  var enc = [encodings.float]

  Direction.encodingLength = encodingLength
  Direction.encode = encode
  Direction.decode = decode

  function encodingLength (obj) {
    var length = 0
    if (defined(obj.inclination)) {
      var len = enc[0].encodingLength(obj.inclination)
      length += 1 + len
    }
    if (defined(obj.azimuth)) {
      var len = enc[0].encodingLength(obj.azimuth)
      length += 1 + len
    }
    return length
  }

  function encode (obj, buf, offset) {
    if (!offset) offset = 0
    if (!buf) buf = Buffer.allocUnsafe(encodingLength(obj))
    var oldOffset = offset
    if (defined(obj.inclination)) {
      buf[offset++] = 13
      enc[0].encode(obj.inclination, buf, offset)
      offset += enc[0].encode.bytes
    }
    if (defined(obj.azimuth)) {
      buf[offset++] = 21
      enc[0].encode(obj.azimuth, buf, offset)
      offset += enc[0].encode.bytes
    }
    encode.bytes = offset - oldOffset
    return buf
  }

  function decode (buf, offset, end) {
    if (!offset) offset = 0
    if (!end) end = buf.length
    if (!(end <= buf.length && offset <= buf.length))
      throw new Error('Decoded message is not valid')
    var oldOffset = offset
    var obj = {
      inclination: 0,
      azimuth: 0
    }
    while (true) {
      if (end <= offset) {
        decode.bytes = offset - oldOffset
        return obj
      }
      var prefix = varint.decode(buf, offset)
      offset += varint.decode.bytes
      var tag = prefix >> 3
      switch (tag) {
        case 1:
          obj.inclination = enc[0].decode(buf, offset)
          offset += enc[0].decode.bytes
          break
        case 2:
          obj.azimuth = enc[0].decode(buf, offset)
          offset += enc[0].decode.bytes
          break
        default:
          offset = skip(prefix & 7, buf, offset)
      }
    }
  }
}

function defineGridPosition () {
  var enc = [encodings.sint64]

  GridPosition.encodingLength = encodingLength
  GridPosition.encode = encode
  GridPosition.decode = decode

  function encodingLength (obj) {
    var length = 0
    if (defined(obj.x)) {
      var len = enc[0].encodingLength(obj.x)
      length += 1 + len
    }
    if (defined(obj.y)) {
      var len = enc[0].encodingLength(obj.y)
      length += 1 + len
    }
    if (defined(obj.z)) {
      var len = enc[0].encodingLength(obj.z)
      length += 1 + len
    }
    return length
  }

  function encode (obj, buf, offset) {
    if (!offset) offset = 0
    if (!buf) buf = Buffer.allocUnsafe(encodingLength(obj))
    var oldOffset = offset
    if (defined(obj.x)) {
      buf[offset++] = 8
      enc[0].encode(obj.x, buf, offset)
      offset += enc[0].encode.bytes
    }
    if (defined(obj.y)) {
      buf[offset++] = 16
      enc[0].encode(obj.y, buf, offset)
      offset += enc[0].encode.bytes
    }
    if (defined(obj.z)) {
      buf[offset++] = 24
      enc[0].encode(obj.z, buf, offset)
      offset += enc[0].encode.bytes
    }
    encode.bytes = offset - oldOffset
    return buf
  }

  function decode (buf, offset, end) {
    if (!offset) offset = 0
    if (!end) end = buf.length
    if (!(end <= buf.length && offset <= buf.length))
      throw new Error('Decoded message is not valid')
    var oldOffset = offset
    var obj = {
      x: 0,
      y: 0,
      z: 0
    }
    while (true) {
      if (end <= offset) {
        decode.bytes = offset - oldOffset
        return obj
      }
      var prefix = varint.decode(buf, offset)
      offset += varint.decode.bytes
      var tag = prefix >> 3
      switch (tag) {
        case 1:
          obj.x = enc[0].decode(buf, offset)
          offset += enc[0].decode.bytes
          break
        case 2:
          obj.y = enc[0].decode(buf, offset)
          offset += enc[0].decode.bytes
          break
        case 3:
          obj.z = enc[0].decode(buf, offset)
          offset += enc[0].decode.bytes
          break
        default:
          offset = skip(prefix & 7, buf, offset)
      }
    }
  }
}

function definePart () {
  var enc = [
    encodings.enum,
    GridPosition,
    encodings.enum,
    encodings.enum,
    Direction,
    encodings.varint
  ]

  Part.encodingLength = encodingLength
  Part.encode = encode
  Part.decode = decode

  function encodingLength (obj) {
    var length = 0
    if (!defined(obj.type)) throw new Error('type is required')
    var len = enc[0].encodingLength(obj.type)
    length += 1 + len
    if (defined(obj.origin)) {
      var len = enc[1].encodingLength(obj.origin)
      length += varint.encodingLength(len)
      length += 1 + len
    }
    if (defined(obj.sizeId)) {
      var len = enc[2].encodingLength(obj.sizeId)
      length += 1 + len
    }
    if (defined(obj.materialId)) {
      var len = enc[3].encodingLength(obj.materialId)
      length += 1 + len
    }
    if (defined(obj.direction)) {
      var len = enc[4].encodingLength(obj.direction)
      length += varint.encodingLength(len)
      length += 1 + len
    }
    if (defined(obj.length)) {
      var len = enc[5].encodingLength(obj.length)
      length += 1 + len
    }
    return length
  }

  function encode (obj, buf, offset) {
    if (!offset) offset = 0
    if (!buf) buf = Buffer.allocUnsafe(encodingLength(obj))
    var oldOffset = offset
    if (!defined(obj.type)) throw new Error('type is required')
    buf[offset++] = 8
    enc[0].encode(obj.type, buf, offset)
    offset += enc[0].encode.bytes
    if (defined(obj.origin)) {
      buf[offset++] = 18
      varint.encode(enc[1].encodingLength(obj.origin), buf, offset)
      offset += varint.encode.bytes
      enc[1].encode(obj.origin, buf, offset)
      offset += enc[1].encode.bytes
    }
    if (defined(obj.sizeId)) {
      buf[offset++] = 24
      enc[2].encode(obj.sizeId, buf, offset)
      offset += enc[2].encode.bytes
    }
    if (defined(obj.materialId)) {
      buf[offset++] = 32
      enc[3].encode(obj.materialId, buf, offset)
      offset += enc[3].encode.bytes
    }
    if (defined(obj.direction)) {
      buf[offset++] = 42
      varint.encode(enc[4].encodingLength(obj.direction), buf, offset)
      offset += varint.encode.bytes
      enc[4].encode(obj.direction, buf, offset)
      offset += enc[4].encode.bytes
    }
    if (defined(obj.length)) {
      buf[offset++] = 48
      enc[5].encode(obj.length, buf, offset)
      offset += enc[5].encode.bytes
    }
    encode.bytes = offset - oldOffset
    return buf
  }

  function decode (buf, offset, end) {
    if (!offset) offset = 0
    if (!end) end = buf.length
    if (!(end <= buf.length && offset <= buf.length))
      throw new Error('Decoded message is not valid')
    var oldOffset = offset
    var obj = {
      type: 0,
      origin: null,
      sizeId: 0,
      materialId: 0,
      direction: null,
      length: 0
    }
    var found0 = false
    while (true) {
      if (end <= offset) {
        if (!found0) throw new Error('Decoded message is not valid')
        decode.bytes = offset - oldOffset
        return obj
      }
      var prefix = varint.decode(buf, offset)
      offset += varint.decode.bytes
      var tag = prefix >> 3
      switch (tag) {
        case 1:
          obj.type = enc[0].decode(buf, offset)
          offset += enc[0].decode.bytes
          found0 = true
          break
        case 2:
          var len = varint.decode(buf, offset)
          offset += varint.decode.bytes
          obj.origin = enc[1].decode(buf, offset, offset + len)
          offset += enc[1].decode.bytes
          break
        case 3:
          obj.sizeId = enc[2].decode(buf, offset)
          offset += enc[2].decode.bytes
          break
        case 4:
          obj.materialId = enc[3].decode(buf, offset)
          offset += enc[3].decode.bytes
          break
        case 5:
          var len = varint.decode(buf, offset)
          offset += varint.decode.bytes
          obj.direction = enc[4].decode(buf, offset, offset + len)
          offset += enc[4].decode.bytes
          break
        case 6:
          obj.length = enc[5].decode(buf, offset)
          offset += enc[5].decode.bytes
          break
        default:
          offset = skip(prefix & 7, buf, offset)
      }
    }
  }
}

function defineModel () {
  var enc = [Part, encodings.enum]

  Model.encodingLength = encodingLength
  Model.encode = encode
  Model.decode = decode

  function encodingLength (obj) {
    var length = 0
    if (defined(obj.parts)) {
      for (var i = 0; i < obj.parts.length; i++) {
        if (!defined(obj.parts[i])) continue
        var len = enc[0].encodingLength(obj.parts[i])
        length += varint.encodingLength(len)
        length += 1 + len
      }
    }
    if (defined(obj.specId)) {
      var len = enc[1].encodingLength(obj.specId)
      length += 1 + len
    }
    return length
  }

  function encode (obj, buf, offset) {
    if (!offset) offset = 0
    if (!buf) buf = Buffer.allocUnsafe(encodingLength(obj))
    var oldOffset = offset
    if (defined(obj.parts)) {
      for (var i = 0; i < obj.parts.length; i++) {
        if (!defined(obj.parts[i])) continue
        buf[offset++] = 10
        varint.encode(enc[0].encodingLength(obj.parts[i]), buf, offset)
        offset += varint.encode.bytes
        enc[0].encode(obj.parts[i], buf, offset)
        offset += enc[0].encode.bytes
      }
    }
    if (defined(obj.specId)) {
      buf[offset++] = 16
      enc[1].encode(obj.specId, buf, offset)
      offset += enc[1].encode.bytes
    }
    encode.bytes = offset - oldOffset
    return buf
  }

  function decode (buf, offset, end) {
    if (!offset) offset = 0
    if (!end) end = buf.length
    if (!(end <= buf.length && offset <= buf.length))
      throw new Error('Decoded message is not valid')
    var oldOffset = offset
    var obj = {
      parts: [],
      specId: 0
    }
    while (true) {
      if (end <= offset) {
        decode.bytes = offset - oldOffset
        return obj
      }
      var prefix = varint.decode(buf, offset)
      offset += varint.decode.bytes
      var tag = prefix >> 3
      switch (tag) {
        case 1:
          var len = varint.decode(buf, offset)
          offset += varint.decode.bytes
          obj.parts.push(enc[0].decode(buf, offset, offset + len))
          offset += enc[0].decode.bytes
          break
        case 2:
          obj.specId = enc[1].decode(buf, offset)
          offset += enc[1].decode.bytes
          break
        default:
          offset = skip(prefix & 7, buf, offset)
      }
    }
  }
}

function defined (val) {
  return (
    val !== null &&
    val !== undefined &&
    (typeof val !== 'number' || !isNaN(val))
  )
}