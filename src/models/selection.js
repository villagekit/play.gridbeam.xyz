import produce from 'immer'
import { prop } from 'ramda'
import * as THREE from 'three'

export const selection = {
  name: 'selection',
  state: {
    isEnabled: true,
    isSelecting: false,
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 0, y: 0 },
    selectableScreenBounds: {}
  },
  reducers: {
    enable: produce(state => {
      state.isEnabled = true
    }),
    disable: produce(state => {
      state.isEnabled = false
    }),
    startSelection: produce(state => {
      state.isSelecting = true
    }),
    endSelection: produce(state => {
      state.isSelecting = false
    }),
    setStartPoint: produce((state, { x, y }) => {
      state.startPoint.x = x
      state.startPoint.y = y
    }),
    setEndPoint: produce((state, { x, y }) => {
      state.endPoint.x = x
      state.endPoint.y = y
    }),
    updateSelectableScreenBounds: produce((state, { scene, camera }) => {
      forEachMesh(scene, mesh => {
        state.selectableScreenBounds[mesh.uuid] = computeScreenBounds({
          mesh,
          camera
        })
      })
    })
  },
  selectors: slice => ({
    isEnabled: () => slice(prop('isEnabled')),
    isSelecting: () => slice(prop('isSelecting')),
    startPoint: () => slice(prop('startPoint')),
    endPoint: () => slice(prop('endPoint')),
    selectableScreenBounds: () => slice(prop('selectableScreenBounds'))
  })
}

function forEachMesh (object, fn) {
  if (object.isMesh) {
    if (object.geometry !== undefined) {
      // TODO better check for whether selectable.
      // maybe store in userData
      if (object.geometry.type === 'BoxGeometry') {
        fn(object)
      }
    }
  }

  if (object.children.length > 0) {
    for (var i = 0; i < object.children.length; i++) {
      forEachMesh(object.children[i], fn)
    }
  }
}

function computeScreenBounds ({ mesh, camera }) {
  var vertices = mesh.geometry.vertices
  var vertex = new THREE.Vector3()
  var min = new THREE.Vector2(1, 1)
  var max = new THREE.Vector2(-1, -1)

  for (var i = 0; i < vertices.length; i++) {
    var vertexWorldCoord = vertex
      .copy(vertices[i])
      .applyMatrix4(mesh.matrixWorld)
    var vertexScreenSpace = vertexWorldCoord.project(camera)
    min.min(vertexScreenSpace)
    max.max(vertexScreenSpace)
  }

  return new THREE.Box2(min, max)
}
