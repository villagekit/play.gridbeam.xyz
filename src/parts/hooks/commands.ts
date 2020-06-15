import { AnyAction } from '@reduxjs/toolkit'
import { mapValues } from 'lodash'
import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  doUpdateParts,
  getCurrentMaterialId,
  getCurrentSizeId,
  getCurrentSpecId,
  getHasSelectedAnyParts,
  getSelectedUuids,
  MaterialId,
  PartType,
  //  ROTATION,
  SizeId,
  SpecId,
  Uuid,
  //  X_AXIS,
  //  Y_AXIS,
  //  Z_AXIS,
} from 'src'

interface CommandActionOptions {
  specId: SpecId
  sizeId: SizeId
  materialId: MaterialId
  selectedUuids: Array<Uuid>
}

interface CommandDescriptor {
  id: string
  label: string
  isEnabled: ({ hasSelected }: { hasSelected: boolean }) => boolean
  action: (options: CommandActionOptions) => AnyAction
}

export interface Command {
  id: string
  label: string
  action: () => AnyAction
}

const commandDescriptors: Array<CommandDescriptor> = [
  {
    id: 'createBeam',
    label: 'New Beam',
    isEnabled: ({ hasSelected }) => !hasSelected,
    action: ({ specId, sizeId, materialId }) =>
      doUpdateParts({
        type: 'create',
        payload: {
          parts: [
            {
              type: PartType.Beam,
              direction: { x: 0, y: 0, z: 0 },
              origin: { x: 0, y: 0, z: 0 },
              length: 5,
              sizeId,
              materialId,
            },
          ],
        },
      }),
  },
  {
    id: 'delete',
    label: 'Delete',
    isEnabled: ({ hasSelected }) => hasSelected,
    action: ({ specId, sizeId, materialId, selectedUuids }) =>
      doUpdateParts({ type: 'delete', payload: { uuids: selectedUuids } }),
  },
]

/*
const commands: Commands = {
  moveForward: () => [
    'doUpdateSelectedParts',
    { update: 'add', path: 'origin.x', value: 1 },
  ],
  moveBackward: () => [
    'doUpdateSelectedParts',
    { update: 'sub', path: 'origin.x', value: 1 },
  ],
  moveRight: () => [
    'doUpdateSelectedParts',
    { update: 'add', path: 'origin.y', value: 1 },
  ],
  moveLeft: () => [
    'doUpdateSelectedParts',
    { update: 'sub', path: 'origin.y', value: 1 },
  ],
  moveUp: () => [
    'doUpdateSelectedParts',
    { update: 'add', path: 'origin.z', value: 1 },
  ],
  moveDown: () => [
    'doUpdateSelectedParts',
    { update: 'sub', path: 'origin.z', value: 1 },
  ],
  rotatePlusX: () => [
    'doUpdateSelectedParts',
    { update: 'rotate', path: 'direction', axis: X_AXIS, angle: ROTATION / 4 },
  ],
  rotateMinusX: () => [
    'doUpdateSelectedParts',
    { update: 'rotate', path: 'direction', axis: X_AXIS, angle: -ROTATION / 4 },
  ],
  rotatePlusY: () => [
    'doUpdateSelectedParts',
    { update: 'rotate', path: 'direction', axis: Y_AXIS, angle: ROTATION / 4 },
  ],
  rotateMinusY: () => [
    'doUpdateSelectedParts',
    { update: 'rotate', path: 'direction', axis: Y_AXIS, angle: -ROTATION / 4 },
  ],
  rotatePlusZ: () => [
    'doUpdateSelectedParts',
    { update: 'rotate', path: 'direction', axis: Z_AXIS, angle: ROTATION / 4 },
  ],
  rotateMinusZ: () => [
    'doUpdateSelectedParts',
    { update: 'rotate', path: 'direction', axis: Z_AXIS, angle: -ROTATION / 4 },
  ],
  createBeam: ({ specId, sizeId, materialId }) => [
    'doAddPart',
    {
      type: PartType.Beam,
      direction: { x: 0, y: 0, z: 0 },
      origin: { x: 0, y: 0, z: 0 },
      length: 5,
      sizeId,
      materialId,
    },
  ],
  removeSelected: () => ['doRemoveSelectedParts', undefined],
  lengthenSelected: () => [
    'doUpdateSelectedParts',
    { update: 'add', path: 'length', value: 1 },
  ],
  unlengthenSelected: () => [
    'doUpdateSelectedParts',
    { update: 'sub', path: 'length', value: 1 },
  ],
}

type CommandName = keyof typeof commands
*/

export function useCommands() {
  const dispatch = useDispatch()

  const hasSelected = useSelector(getHasSelectedAnyParts)
  const selectedUuids = useSelector(getSelectedUuids)
  const specId = useSelector(getCurrentSpecId)
  const sizeId = useSelector(getCurrentSizeId)
  const materialId = useSelector(getCurrentMaterialId)
  const actionOptions = useMemo(
    () => ({
      specId,
      sizeId,
      materialId,
      selectedUuids,
    }),
    [specId, sizeId, materialId, selectedUuids],
  )

  const readyCommands = useMemo(() => {
    let commands: Array<Command> = []

    commandDescriptors.forEach((commandDescriptor) => {
      const { id, label, isEnabled, action } = commandDescriptor
      if (!isEnabled({ hasSelected })) return
      commands.push({
        id,
        label,
        action: () => dispatch(action(actionOptions)),
      })
    })

    return commands
  }, [actionOptions, dispatch, hasSelected])

  return readyCommands
}
