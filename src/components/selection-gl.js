import React from 'react'
import { useStore, useSelector } from 'react-redux'
import { Box2, Vector2 } from 'three'
import { useThree } from 'react-three-fiber'
import { prop } from 'ramda'

import useModelStore from '../stores/model'

export default SelectionGl

function SelectionGl (props) {
  const { select, dispatch } = useStore()

  const isEnabled = useSelector(select.selection.isEnabled)
  const isSelecting = useSelector(select.selection.isSelecting)
  const startPoint = useSelector(select.selection.startPoint)
  const endPoint = useSelector(select.selection.endPoint)
  const selectableScreenBounds = useSelector(
    select.selection.selectableScreenBounds
  )

  const selects = useModelStore(prop('selects'))

  const { scene, camera } = useThree()
  // this optimization works because the camera doesn't move once selecting
  React.useEffect(() => {
    if (!isEnabled) return
    if (!isSelecting) return
    dispatch.selection.updateSelectableScreenBounds({ scene, camera })
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
    console.log('selects', selections)
    selects(selections)
  }, [isEnabled, isSelecting, selectionScreenBounds, selectableScreenBounds])

  return null
}
