import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useThree } from 'react-three-fiber'
import {
  doEndSelection,
  doSelectParts,
  doSetSelectionEndPoint,
  doSetSelectionStartPoint,
  doStartSelection,
  doUpdateSelectableScreenBounds,
  getIsSelecting,
  getIsSelectionEnabled,
  getSceneSize,
  getSelectableScreenBounds,
  getSelectionEndPoint,
  getSelectionStartPoint,
  Uuid,
} from 'src'
import { Box2, MOUSE, Vector2 } from 'three'

export function useGlSelection() {
  const dispatch = useDispatch()

  const isEnabled = useSelector(getIsSelectionEnabled)
  const isSelecting = useSelector(getIsSelecting)
  const startPoint = useSelector(getSelectionStartPoint)
  const endPoint = useSelector(getSelectionEndPoint)
  const selectableScreenBounds = useSelector(getSelectableScreenBounds)

  const { gl, scene, camera } = useThree()

  const handleStartSelection = React.useCallback(() => {
    dispatch(doStartSelection())
  }, [dispatch])

  const handleEndSelection = React.useCallback(() => {
    dispatch(doEndSelection())
  }, [dispatch])

  // when starting a new selection, calculate screen bounds of all parts
  // this optimization works because the camera doesn't move once selecting
  React.useEffect(() => {
    if (!isEnabled) return
    if (!isSelecting) return
    dispatch(doUpdateSelectableScreenBounds({ scene, camera }))
  }, [camera, dispatch, isEnabled, isSelecting, scene])

  // create 2d box to represent start and end point of selection
  let selectionScreenBounds = React.useMemo(() => new Box2(), [])
  React.useEffect(() => {
    selectionScreenBounds.makeEmpty()
    if (startPoint == null || endPoint == null) return
    selectionScreenBounds.expandByPoint(new Vector2(startPoint.x, startPoint.y))
    selectionScreenBounds.expandByPoint(new Vector2(endPoint.x, endPoint.y))
  }, [selectionScreenBounds, startPoint, endPoint])

  // select any parts within the box
  React.useEffect(() => {
    if (!isEnabled) return
    if (!isSelecting) return

    const selections: Array<Uuid> = []
    Object.entries(selectableScreenBounds).forEach(([uuid, selectableBox]) => {
      if (selectionScreenBounds.containsBox(selectableBox)) {
        selections.push(uuid)
      }
    })
    dispatch(doSelectParts(selections))
  }, [
    isEnabled,
    isSelecting,
    selectionScreenBounds,
    selectableScreenBounds,
    dispatch,
  ])

  /*
  // TODO: what is the use case for this?
  // can be problematic when selecting and you hover over a camera widget button
  //
  // when selection is disabled, force end
  React.useEffect(() => {
    if (!isEnabled) handleEndSelection()
  }, [handleEndSelection, isEnabled])
  */

  const size = useSelector(getSceneSize)

  // handle selection events
  React.useEffect(() => {
    gl.domElement.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    function handleMouseDown(ev: MouseEvent) {
      if (!isEnabled) return
      if (ev.altKey) return
      if (ev.button !== MOUSE.LEFT) return
      handleStartSelection()
      handleStart(ev)
    }

    function handleMouseMove(ev: MouseEvent) {
      if (!isEnabled) return
      if (!isSelecting) return
      handleEnd(ev)
    }

    function handleMouseUp(ev: MouseEvent) {
      if (!isEnabled) return
      if (!isSelecting) return
      handleEndSelection()
      handleEnd(ev)
    }

    function handleStart(ev: MouseEvent) {
      const point = getSelectionPoint(ev)
      if (Math.abs(point.x) > 1 || Math.abs(point.y) > 1) return
      dispatch(doSetSelectionStartPoint(point))
    }
    function handleEnd(ev: MouseEvent) {
      const point = getSelectionPoint(ev)
      if (Math.abs(point.x) > 1 || Math.abs(point.y) > 1) return
      dispatch(doSetSelectionEndPoint(point))
    }

    function getSelectionPoint(ev: MouseEvent) {
      if (size == null) return { x: 0, y: 0 }
      const mouseX = (ev.clientX / size.width) * 2 - 1
      const mouseY = -(ev.clientY / size.height) * 2 + 1
      return { x: mouseX, y: mouseY }
    }
  }, [
    gl,
    size,
    dispatch,
    isEnabled,
    isSelecting,
    handleStartSelection,
    handleEndSelection,
  ])
}
