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

  const { scene, camera } = useThree()
  // this optimization works because the camera doesn't move once selecting
  React.useEffect(() => {
    if (!isEnabled) return
    if (!isSelecting) return
    dispatch(doUpdateSelectableScreenBounds({ scene, camera }))
  }, [camera, dispatch, isEnabled, isSelecting, scene])

  const selectionScreenBounds = React.useMemo(() => {
    const box = new Box2()
    box.makeEmpty()
    box.expandByPoint(new Vector2(startPoint.x, startPoint.y))
    box.expandByPoint(new Vector2(endPoint.x, endPoint.y))
    return box
  }, [startPoint, endPoint])

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
}

export function useDomSelection() {
  const dispatch = useDispatch()

  const isEnabled = useSelector(getIsSelectionEnabled)
  const isSelecting = useSelector(getIsSelecting)
  const startPoint = useSelector(getSelectionStartPoint)
  const endPoint = useSelector(getSelectionEndPoint)

  const handleStartSelection = React.useCallback(() => {
    dispatch(doStartSelection())
  }, [dispatch])

  const handleEndSelection = React.useCallback(() => {
    dispatch(doEndSelection())
  }, [dispatch])

  React.useEffect(() => {
    if (!isEnabled) handleEndSelection()
  }, [handleEndSelection, isEnabled])

  React.useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    function handleMouseDown(ev: MouseEvent) {
      console.log('selection down')
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
      console.log('selection up')
      if (!isEnabled) return
      if (!isSelecting) return
      handleEndSelection()
      handleEnd(ev)
    }

    function handleStart(ev: MouseEvent) {
      dispatch(
        doSetSelectionStartPoint({
          x: (ev.clientX / window.innerWidth) * 2 - 1,
          y: -(ev.clientY / window.innerHeight) * 2 + 1,
        }),
      )
    }
    function handleEnd(ev: MouseEvent) {
      dispatch(
        doSetSelectionEndPoint({
          x: (ev.clientX / window.innerWidth) * 2 - 1,
          y: -(ev.clientY / window.innerHeight) * 2 + 1,
        }),
      )
    }
  }, [
    dispatch,
    isEnabled,
    isSelecting,
    handleStartSelection,
    handleEndSelection,
  ])

  return {
    isSelecting,
    startPoint,
    endPoint,
  }
}
