import { createSelector, createSlice } from '@reduxjs/toolkit'
import { flow, mapValues, property } from 'lodash'
import {
  Box2,
  Camera,
  Geometry,
  Mesh,
  Object3D,
  Scene,
  Vector2,
  Vector3,
} from 'three'

import { AppDispatch, RootState } from './'

export interface Point {
  x: number
  y: number
}
export interface Bounds {
  min: [number, number]
  max: [number, number]
}
export interface SelectableScreenBounds {
  [uuid: string]: Bounds
}
export interface SelectionState {
  isEnabled: boolean
  isSelecting: boolean
  startPoint: Point
  endPoint: Point
  selectableScreenBounds: SelectableScreenBounds
}

const initialState: SelectionState = {
  isEnabled: true,
  isSelecting: false,
  startPoint: { x: 0, y: 0 },
  endPoint: { x: 0, y: 0 },
  selectableScreenBounds: {},
}

export const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    doEnableSelection: (state) => {
      state.isEnabled = true
    },
    doDisableSelection: (state) => {
      state.isEnabled = false
    },
    doStartSelection: (state) => {
      state.isSelecting = true
    },
    doEndSelection: (state) => {
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
    doSetSelectableScreenBounds: (state, action) => {
      state.selectableScreenBounds = action.payload
    },
  },
})

export const {
  doEnableSelection,
  doDisableSelection,
  doStartSelection,
  doEndSelection,
  doSetSelectionStartPoint,
  doSetSelectionEndPoint,
  doSetSelectableScreenBounds,
} = selectionSlice.actions

export default selectionSlice.reducer

export const doUpdateSelectableScreenBounds = ({
  scene,
  camera,
}: {
  scene: Scene
  camera: Camera
}) => (dispatch: AppDispatch) => {
  const selectableScreenBounds: SelectableScreenBounds = {}
  forEachMesh(scene, (mesh: Object3D) => {
    selectableScreenBounds[mesh.uuid] = computeScreenBounds({
      mesh: mesh as Mesh,
      camera,
    })
  })
  dispatch(doSetSelectableScreenBounds(selectableScreenBounds))
}

export const getSelectionState = (state: RootState): SelectionState =>
  state.selection
export const getIsSelectionEnabled = createSelector(
  getSelectionState,
  (state) => state.isEnabled,
)
export const getIsSelecting = createSelector(
  getSelectionState,
  (state) => state.isSelecting,
)
export const getSelectionStartPoint = createSelector(
  getSelectionState,
  (state) => state.startPoint,
)
export const getSelectionEndPoint = createSelector(
  getSelectionState,
  (state) => state.endPoint,
)

export const getSelectableScreenBounds = createSelector(
  getSelectionState,
  flow(
    property('selectableScreenBounds'),
    (selectableScreenBounds: SelectableScreenBounds) => {
      return mapValues(selectableScreenBounds, (bounds) => {
        const { min, max } = bounds
        return new Box2(
          new Vector2().fromArray(min),
          new Vector2().fromArray(max),
        )
      })
    },
  ),
)

function forEachMesh(obj: Object3D, fn: (obj: Object3D) => void) {
  // @ts-ignore
  if (obj.isMesh) {
    const mesh = obj as Mesh
    if (mesh.geometry !== undefined) {
      // TODO better check for whether selectable.
      // maybe store in userData
      if (mesh.geometry.type === 'BoxGeometry') {
        fn(mesh)
      }
    }
  }

  if (obj.children.length > 0) {
    for (let i = 0; i < obj.children.length; i++) {
      forEachMesh(obj.children[i], fn)
    }
  }
}

function computeScreenBounds({
  mesh,
  camera,
}: {
  mesh: Mesh
  camera: Camera
}): Bounds {
  if (mesh.geometry.type === 'BufferGeometry') {
    throw new Error('not implemented')
  }
  const geometry = mesh.geometry as Geometry
  const vertices = geometry.vertices
  const vertex = new Vector3()
  const min = new Vector2(1, 1)
  const max = new Vector2(-1, -1)

  for (let i = 0; i < vertices.length; i++) {
    const vertexWorldCoord = vertex
      .copy(vertices[i])
      .applyMatrix4(mesh.matrixWorld)
    const vertexScreenSpace = new Vector2().fromArray(
      vertexWorldCoord.project(camera).toArray(),
    )
    min.min(vertexScreenSpace)
    max.max(vertexScreenSpace)
  }

  return {
    min: [min.x, min.y],
    max: [max.x, max.y],
  }
}
