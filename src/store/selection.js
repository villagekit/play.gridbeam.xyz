import { createSelector, createSlice } from '@reduxjs/toolkit'
import { property } from 'lodash'
import { Box2, Vector2, Vector3 } from 'three'

export const selectionSlice = createSlice({
  name: 'selection',
  initialState: {
    isEnabled: true,
    isSelecting: false,
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 0, y: 0 },
    selectableScreenBounds: {}
  },
  reducers: {
    doEnableSelection: state => {
      state.isEnabled = true
    },
    doDisableSelection: state => {
      state.isEnabled = false
    },
    doStartSelection: state => {
      state.isSelecting = true
    },
    doEndSelection: state => {
      state.isSelecting = false
    },
    doSetSelectionStartPoint: (state, action) => {
      const { x, y } = action.payload
      state.startPoint.x = x
      state.startPoint.y = y
    },
    doSetSelectionEndPoint: (state, action) => {
      const { x, y } = action.payload
      state.endPoint.x = x
      state.endPoint.y = y
    },
    doUpdateSelectableScreenBounds: (state, action) => {
      const { scene, camera } = action.payload
      forEachMesh(scene, mesh => {
        state.selectableScreenBounds[mesh.uuid] = computeScreenBounds({
          mesh,
          camera
        })
      })
    }
  }
})

export const {
  doEnableSelection,
  doDisableSelection,
  doStartSelection,
  doEndSelection,
  doSetSelectionStartPoint,
  doSetSelectionEndPoint,
  doUpdateSelectableScreenBounds
} = selectionSlice.actions

export default selectionSlice.reducer

export const getSelectionState = property('selection')
export const getIsSelectionEnabled = createSelector(
  getSelectionState,
  property('isEnabled')
)
export const getIsSelecting = createSelector(
  getSelectionState,
  property('isSelecting')
)
export const getSelectionStartPoint = createSelector(
  getSelectionState,
  property('startPoint')
)
export const getSelectionEndPoint = createSelector(
  getSelectionState,
  property('endPoint')
)

export const getSelectableScreenBounds = createSelector(
  getSelectionState,
  property('selectableScreenBounds')
)

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
  var vertex = new Vector3()
  var min = new Vector2(1, 1)
  var max = new Vector2(-1, -1)

  for (var i = 0; i < vertices.length; i++) {
    var vertexWorldCoord = vertex
      .copy(vertices[i])
      .applyMatrix4(mesh.matrixWorld)
    var vertexScreenSpace = vertexWorldCoord.project(camera)
    min.min(vertexScreenSpace)
    max.max(vertexScreenSpace)
  }

  return new Box2(min, max)
}
