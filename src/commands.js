import { useMemo } from 'react'
import { useSelector, useStore } from 'react-redux'
import { map } from 'ramda'

import { X_AXIS, Y_AXIS, Z_AXIS } from './helpers/axis'
import { ROTATION, rotateDirection } from './helpers/rotation'
import Codec from './codec'

function useCommands () {
  const { select, dispatch } = useStore()

  const hasSelected = useSelector(select.parts.hasSelected)
  const specId = useSelector(select.spec.currentSpecId)
  const sizeId = useSelector(select.spec.currentSizeId)
  const materialId = useSelector(select.spec.currentMaterialId)

  const methods = {
    addPart: dispatch.parts.addPart,
    updateSelected: dispatch.parts.updateSelected,
    removeSelected: dispatch.parts.removeSelected
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
      return () => method(...methodArgs)
    }, commands)
  }, [hasSelected])

  return readyCommands
}

export default useCommands

const commands = {
  moveForward: () => ['updateSelected', part => part.origin.x++],
  moveBackward: () => ['updateSelected', part => part.origin.y--],
  moveRight: () => ['updateSelected', part => part.origin.y++],
  moveLeft: () => ['updateSelected', part => part.origin.y--],
  moveUp: () => ['updateSelected', part => part.origin.z++],
  moveDown: () => ['updateSelected', part => part.origin.z--],
  rotatePlusX: () => ['updateSelected', rotateUpdater(X_AXIS, ROTATION / 4)],
  rotateMinusX: () => ['updateSelected', rotateUpdater(X_AXIS, -ROTATION / 4)],
  rotatePlusY: () => ['updateSelected', rotateUpdater(Y_AXIS, ROTATION / 4)],
  rotateMinusY: () => ['updateSelected', rotateUpdater(Y_AXIS, -ROTATION / 4)],
  rotatePlusZ: () => ['updateSelected', rotateUpdater(Z_AXIS, ROTATION / 4)],
  rotateMinusZ: () => ['updateSelected', rotateUpdater(Z_AXIS, -ROTATION / 4)],
  createBeam: ({ specId, sizeId, materialId }) => [
    'addPart',
    {
      type: Codec.PartType.Beam,
      direction: { x: 0, y: 0, z: 0 },
      origin: { x: 0, y: 0, z: 0 },
      length: 5,
      sizeId,
      materialId
    }
  ],
  removeSelected: () => ['removeSelected'],
  lengthenSelected: () => ['updateSelected', part => part.length++],
  unlengthenSelected: () => ['updateSelected', part => part.length--]
}

function rotateUpdater (axis, angle) {
  return part => {
    const nextDirection = rotateDirection(part.direction, axis, angle)
    Object.assign(part.direction, nextDirection)
  }
}
