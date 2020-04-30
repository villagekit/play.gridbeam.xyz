import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box2, Vector2 } from 'three'
import { useThree } from 'react-three-fiber'

import {
  doSelectParts,
  doUpdateSelectableScreenBounds,
  getIsSelectionEnabled,
  getIsSelecting,
  getSelectionStartPoint,
  getSelectionEndPoint,
  getSelectableScreenBounds
} from '../store'

export default SelectionGl

function SelectionGl (props) {
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
  }, [isEnabled, isSelecting])

  const selectionScreenBounds = React.useMemo(() => {
    var box = new Box2()
    box.makeEmpty()
    box.expandByPoint(new Vector2(startPoint.x, startPoint.y))
    box.expandByPoint(new Vector2(endPoint.x, endPoint.y))
    return box
  }, [startPoint, endPoint])

  React.useEffect(() => {
    if (!isEnabled) return
    if (!isSelecting) return

    var selections = []
    Object.entries(selectableScreenBounds).forEach(([uuid, selectableBox]) => {
      if (selectionScreenBounds.containsBox(selectableBox)) {
        selections.push(uuid)
      }
    })
    dispatch(doSelectParts(selections))
  }, [isEnabled, isSelecting, selectionScreenBounds, selectableScreenBounds])

  return null
}
