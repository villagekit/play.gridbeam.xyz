import { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { mapValues } from 'lodash'

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
    return mapValues(commands, methodGen => {
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
    })
  }, [hasSelected])

  return readyCommands
}

export default useCommands

const commands = {
  moveForward: () => [
    'doUpdateSelectedParts',
    { update: 'add', path: 'origin.x', value: 1 }
  ],
  moveBackward: () => [
    'doUpdateSelectedParts',
    { update: 'sub', path: 'origin.x', value: 1 }
  ],
  moveRight: () => [
    'doUpdateSelectedParts',
    { update: 'add', path: 'origin.y', value: 1 }
  ],
  moveLeft: () => [
    'doUpdateSelectedParts',
    { update: 'sub', path: 'origin.y', value: 1 }
  ],
  moveRight: () => [
    'doUpdateSelectedParts',
    { update: 'add', path: 'origin.z', value: 1 }
  ],
  moveLeft: () => [
    'doUpdateSelectedParts',
    { update: 'sub', path: 'origin.z', value: 1 }
  ],
  rotatePlusX: () => [
    'doUpdateSelectedParts',
    { update: 'rotate', path: 'direction', axis: X_AXIS, angle: ROTATION / 4 }
  ],
  rotateMinusX: () => [
    'doUpdateSelectedParts',
    { update: 'rotate', path: 'direction', axis: X_AXIS, angle: -ROTATION / 4 }
  ],
  rotatePlusY: () => [
    'doUpdateSelectedParts',
    { update: 'rotate', path: 'direction', axis: Y_AXIS, angle: ROTATION / 4 }
  ],
  rotateMinusY: () => [
    'doUpdateSelectedParts',
    { update: 'rotate', path: 'direction', axis: Y_AXIS, angle: -ROTATION / 4 }
  ],
  rotatePlusZ: () => [
    'doUpdateSelectedParts',
    { update: 'rotate', path: 'direction', axis: Z_AXIS, angle: ROTATION / 4 }
  ],
  rotateMinusZ: () => [
    'doUpdateSelectedParts',
    { update: 'rotate', path: 'direction', axis: Z_AXIS, angle: -ROTATION / 4 }
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
  removeSelectedParts: () => ['doRemoveSelectedParts'],
  lengthenSelected: () => [
    'doUpdateSelectedParts',
    { update: 'add', path: 'length', value: 1 }
  ],
  unlengthenSelected: () => [
    'doUpdateSelectedParts',
    { update: 'sub', path: 'length', value: 1 }
  ]
}
