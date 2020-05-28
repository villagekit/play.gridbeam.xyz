import { useCallback } from 'react'
import {
  doDisableCameraControl,
  doDisableSelection,
  doEnableCameraControl,
  doEnableSelection,
  doHoverPart,
  doSelectParts,
  doSetAnyPartIsMoving,
  doUnhoverPart,
  doUpdatePart,
  doUpdateSelectedParts,
  UpdateDescriptor,
  useAppDispatch,
  Uuid,
} from 'src'

export function usePartActions(uuid: Uuid) {
  const dispatch = useAppDispatch()

  const hover = useCallback(() => dispatch(doHoverPart(uuid)), [dispatch, uuid])
  const unhover = useCallback(() => dispatch(doUnhoverPart(uuid)), [
    dispatch,
    uuid,
  ])
  const select = useCallback(() => dispatch(doSelectParts([uuid])), [
    dispatch,
    uuid,
  ])
  const move = useCallback(
    (delta: [number, number, number]) => {
      dispatch(
        doUpdateSelectedParts([
          { update: 'add', path: 'origin.x', value: delta[0] },
          { update: 'add', path: 'origin.y', value: delta[1] },
          { update: 'add', path: 'origin.z', value: delta[2] },
        ]),
      )
    },
    [dispatch],
  )

  const lockBeforeMoving = useCallback(() => {
    dispatch(doDisableCameraControl())
    dispatch(doDisableSelection())
    dispatch(doSetAnyPartIsMoving(true))
  }, [dispatch])

  const unlockAfterMoving = useCallback(() => {
    dispatch(doEnableCameraControl())
    dispatch(doEnableSelection())
    dispatch(doSetAnyPartIsMoving(false))
  }, [dispatch])

  const updatePart = useCallback(
    (updater: UpdateDescriptor) => {
      dispatch(doUpdatePart({ uuid, updater }))
    },
    [dispatch, uuid],
  )

  return {
    hover,
    unhover,
    select,
    move,
    lockBeforeMoving,
    unlockAfterMoving,
    updatePart,
  }
}
