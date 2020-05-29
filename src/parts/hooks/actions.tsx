import { useCallback } from 'react'
import {
  doDisableCameraControl,
  doDisableSelection,
  doEnableCameraControl,
  doEnableSelection,
  doEndPartTransition,
  doHoverPart,
  doSelectParts,
  doStartPartTransition,
  doUnhoverPart,
  doUpdatePart,
  doUpdatePartTransition,
  doUpdateSelectedParts,
  PartTransitionType,
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

  const startTransition = useCallback(
    (transitionType: PartTransitionType) => {
      dispatch(doDisableCameraControl())
      dispatch(doDisableSelection())
      dispatch(doStartPartTransition(transitionType))
    },
    [dispatch],
  )

  const endTransition = useCallback(() => {
    dispatch(doEnableCameraControl())
    dispatch(doEnableSelection())
    dispatch(doEndPartTransition())
  }, [dispatch])

  const startMoveTransition = useCallback(() => {
    startTransition(PartTransitionType.move)
  }, [startTransition])
  const updateMoveTransition = useCallback(
    (delta: [number, number, number]) => {
      dispatch(
        doUpdatePartTransition([
          { update: 'add', path: 'origin.x', value: delta[0] },
          { update: 'add', path: 'origin.y', value: delta[1] },
          { update: 'add', path: 'origin.z', value: delta[2] },
        ]),
      )
    },
    [dispatch],
  )
  const endMoveTransition = useCallback(() => {
    endTransition()
  }, [endTransition])

  const startLengthTransition = useCallback(() => {
    startTransition(PartTransitionType.length)
  }, [startTransition])
  const updateLengthTransition = useCallback(
    (length: number) => {
      dispatch(
        doUpdatePartTransition({
          update: 'add',
          path: 'length',
          value: length,
        }),
      )
    },
    [dispatch],
  )
  const endLengthTransition = useCallback(() => {
    endTransition()
  }, [endTransition])

  return {
    hover,
    unhover,
    select,
    startMoveTransition,
    updateMoveTransition,
    endMoveTransition,
    startLengthTransition,
    updateLengthTransition,
    endLengthTransition,
  }
}
