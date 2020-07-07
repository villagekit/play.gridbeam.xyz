import { useCallback, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
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
  getSelectedUuids,
  LengthDirection,
  PartTransition,
  useAppDispatch,
  Uuid,
} from 'src'
import { MathUtils } from 'three'

export function usePartActions(uuid: Uuid) {
  const dispatch = useAppDispatch()

  const selectedUuids = useSelector(getSelectedUuids)

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
          uuids: selectedUuids,
          delta,
        }),
      )
    },
    [dispatch, selectedUuids],
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
          uuids: [uuid],
          delta,
          lengthDirection,
        }),
      )
    },
    [dispatch, uuid],
  )
  const endLengthTransition = useCallback(() => {
    endTransition()
  }, [endTransition])

  const [copyingUuids, setCopyingUuids] = useState<null | Array<Uuid>>(null)
  const isCopying = useMemo(() => copyingUuids != null, [copyingUuids])

  const startCopyTransition = useCallback(() => {
    const nextCopyingUuids = selectedUuids.map(() => MathUtils.generateUUID())
    setCopyingUuids(nextCopyingUuids)
    startTransition('create')
  }, [setCopyingUuids, selectedUuids, startTransition])
  const updateCopyTransition = useCallback(
    (delta: [number, number, number]) => {
      if (copyingUuids == null) return
      dispatch(
        doUpdatePartTransition({
          uuids: copyingUuids,
          delta,
        }),
      )
    },
    [dispatch, copyingUuids],
  )
  const endCopyTransition = useCallback(() => {
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
    isCopying,
    startCopyTransition,
    updateCopyTransition,
    endCopyTransition,
  }
}
