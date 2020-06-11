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
  doUpdatePartTransition,
  LengthDirection,
  PartTransition,
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
    (transitionType: PartTransition['type']) => {
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
    startTransition('move')
  }, [startTransition])
  const updateMoveTransition = useCallback(
    (delta: [number, number, number]) => {
      dispatch(
        doUpdatePartTransition({
          delta,
        }),
      )
    },
    [dispatch],
  )
  const endMoveTransition = useCallback(() => {
    endTransition()
  }, [endTransition])

  const startLengthTransition = useCallback(() => {
    select()
    startTransition('scale')
  }, [select, startTransition])
  const updateLengthTransition = useCallback(
    (delta: number, lengthDirection: LengthDirection) => {
      dispatch(
        doUpdatePartTransition({
          delta,
          lengthDirection,
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
