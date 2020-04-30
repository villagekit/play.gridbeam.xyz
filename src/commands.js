import { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { map } from 'ramda'

import {
  doAddPart,
  doUpdateSelectedParts,
  doRemoveSelectedParts,
  getCurrentSpecId,
  getCurrentSizeId,
  getCurrentMaterialId,
  getHasSelectedAnyParts
} from './store'
import { X_AXIS, Y_AXIS, Z_AXIS } from './helpers/axis'
import { ROTATION, rotateDirection } from './helpers/rotation'
import Codec from './codec'

function useCommands () {
  const dispatch = useDispatch()

  const hasSelected = useSelector(getHasSelectedAnyParts)
  const specId = useSelector(getCurrentSpecId)
  const sizeId = useSelector(getCurrentSizeId)
  const materialId = useSelector(getCurrentMaterialId)

  const methods = {
    doAddPart,
    doUpdateSelectedParts,
    doRemoveSelectedParts
  }

  const readyCommands = useMemo(() => {
    return map(methodGen => {
      const [methodName, ...methodArgs] = methodGen({
        specId,
        sizeId,
        materialId
      })
      const method = methods[methodName]
      if (method == null) return
      if (methodName.endsWith('Selected') && !hasSelected) {
        return () => {}
      }
      return () => dispatch(method(...methodArgs))
    }, commands)
  }, [hasSelected])

  return readyCommands
}

export default useCommands

const commands = {
  moveForward: () => ['doUpdateSelectedParts', part => part.origin.x++],
  moveBackward: () => ['doUpdateSelectedParts', part => part.origin.x--],
  moveRight: () => ['doUpdateSelectedParts', part => part.origin.y++],
  moveLeft: () => ['doUpdateSelectedParts', part => part.origin.y--],
  moveUp: () => ['doUpdateSelectedParts', part => part.origin.z++],
  moveDown: () => ['doUpdateSelectedParts', part => part.origin.z--],
  rotatePlusX: () => [
    'doUpdateSelectedParts',
    rotateUpdater(X_AXIS, ROTATION / 4)
  ],
  rotateMinusX: () => [
    'doUpdateSelectedParts',
    rotateUpdater(X_AXIS, -ROTATION / 4)
  ],
  rotatePlusY: () => [
    'doUpdateSelectedParts',
    rotateUpdater(Y_AXIS, ROTATION / 4)
  ],
  rotateMinusY: () => [
    'doUpdateSelectedParts',
    rotateUpdater(Y_AXIS, -ROTATION / 4)
  ],
  rotatePlusZ: () => [
    'doUpdateSelectedParts',
    rotateUpdater(Z_AXIS, ROTATION / 4)
  ],
  rotateMinusZ: () => [
    'doUpdateSelectedParts',
    rotateUpdater(Z_AXIS, -ROTATION / 4)
  ],
  createBeam: ({ specId, sizeId, materialId }) => [
    'doAddPart',
    {
      type: Codec.PartType.Beam,
      direction: { x: 0, y: 0, z: 0 },
      origin: { x: 0, y: 0, z: 0 },
      length: 5,
      sizeId,
      materialId
    }
  ],
  doRemoveSelectedParts: () => ['doRemoveSelectedParts'],
  lengthenSelected: () => ['doUpdateSelectedParts', part => part.length++],
  unlengthenSelected: () => ['doUpdateSelectedParts', part => part.length--]
}

function rotateUpdater (axis, angle) {
  return part => {
    const nextDirection = rotateDirection(part.direction, axis, angle)
    Object.assign(part.direction, nextDirection)
  }
}
