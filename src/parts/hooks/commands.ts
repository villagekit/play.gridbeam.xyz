import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  doRedoPartUpdate,
  doUndoPartUpdate,
  doUpdateParts,
  getCurrentMaterialId,
  getCurrentSizeId,
  getHasSelectedAnyParts,
  getSelectedUuids,
  PartType,
  //  ROTATION,
  useClipboard,
  //  X_AXIS,
  //  Y_AXIS,
  //  Z_AXIS,
} from 'src'
import { MathUtils } from 'three'

export interface Command {
  id: string
  label: string
  action: () => void
}
export type Commands = Array<Command>

export function useCommands(): Array<Command> {
  const partCommands = usePartCommands()
  const clipboardCommands = useClipboardCommands()
  const historyCommands = useHistoryCommands()

  return [...partCommands, ...clipboardCommands, ...historyCommands]
}

function usePartCommands() {
  const dispatch = useDispatch()
  const hasSelected = useSelector(getHasSelectedAnyParts)
  const selectedUuids = useSelector(getSelectedUuids)
  const sizeId = useSelector(getCurrentSizeId)
  const materialId = useSelector(getCurrentMaterialId)

  const deleteSelectedCommand = useMemo<Command>(
    () => ({
      id: 'deleteSelected',
      label: 'Delete Selected',
      action: () =>
        dispatch(
          doUpdateParts({ type: 'delete', payload: { uuids: selectedUuids } }),
        ),
    }),
    [dispatch, selectedUuids],
  )

  const createBeamCommands = useMemo<Commands>(
    () => [
      {
        id: 'createBeamX',
        label: 'New X Beam',
        action: () =>
          dispatch(
            doUpdateParts({
              type: 'create',
              payload: {
                uuids: [MathUtils.generateUUID()],
                parts: [
                  {
                    type: PartType.Beam,
                    direction: { x: 1, y: 0, z: 0 },
                    origin: { x: 0, y: 0, z: 0 },
                    length: 5,
                    sizeId,
                    materialId,
                  },
                ],
              },
            }),
          ),
      },
      {
        id: 'createBeamY',
        label: 'New Y Beam',
        action: () =>
          dispatch(
            doUpdateParts({
              type: 'create',
              payload: {
                uuids: [MathUtils.generateUUID()],
                parts: [
                  {
                    type: PartType.Beam,
                    direction: { x: 0, y: 1, z: 0 },
                    origin: { x: 0, y: 0, z: 0 },
                    length: 5,
                    sizeId,
                    materialId,
                  },
                ],
              },
            }),
          ),
      },
      {
        id: 'createBeamZ',
        label: 'New Z Beam',
        action: () =>
          dispatch(
            doUpdateParts({
              type: 'create',
              payload: {
                uuids: [MathUtils.generateUUID()],
                parts: [
                  {
                    type: PartType.Beam,
                    direction: { x: 0, y: 0, z: 1 },
                    origin: { x: 0, y: 0, z: 0 },
                    length: 5,
                    sizeId,
                    materialId,
                  },
                ],
              },
            }),
          ),
      },
    ],
    [dispatch, sizeId, materialId],
  )

  const commands = useMemo<Commands>(() => {
    if (hasSelected) {
      return [deleteSelectedCommand, ...createBeamCommands]
    } else {
      return [...createBeamCommands]
    }
  }, [createBeamCommands, deleteSelectedCommand, hasSelected])

  return commands
}

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

function useClipboardCommands() {
  const { cut, copy, paste } = useClipboard()
  const clipboardCommands = useMemo<Commands>(
    () => [
      {
        id: 'cut',
        label: 'Cut',
        action: cut,
      },
      {
        id: 'copy',
        label: 'Copy',
        action: copy,
      },
      {
        id: 'paste',
        label: 'Paste',
        action: paste,
      },
    ],
    [cut, copy, paste],
  )
  return clipboardCommands
}

function useHistoryCommands() {
  const dispatch = useDispatch()
  const historyCommands = useMemo<Commands>(
    () => [
      {
        id: 'undo',
        label: 'Undo',
        action: () => dispatch(doUndoPartUpdate()),
      },
      {
        id: 'redo',
        label: 'Redo',
        action: () => dispatch(doRedoPartUpdate()),
      },
    ],
    [dispatch],
  )

  return historyCommands
}
