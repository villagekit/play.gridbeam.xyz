import { useMemo } from 'react'
import { useSelector, useStore } from 'react-redux'
import { map } from 'ramda'

import { rotationByDirection } from './models/parts'
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
  rotateNextInclination: () => [
    'updateSelected',
    part => (part.rotation.inclination += Math.PI / 2)
  ],
  rotatePrevInclination: () => [
    'updateSelected',
    part => (part.rotation.inclination -= Math.PI / 2)
  ],
  rotateNextAzimuth: () => [
    'updateSelected',
    part => (part.rotation.azimuth += Math.PI / 2)
  ],
  rotatePrevAzimuth: () => [
    'updateSelected',
    part => (part.rotation.azimuth -= Math.PI / 2)
  ],
  createBeam: ({ specId, sizeId, materialId }) => [
    'addPart',
    {
      type: Codec.PartType.Beam,
      rotation: rotationByDirection.x,
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
