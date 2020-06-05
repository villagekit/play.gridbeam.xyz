import { useCallback } from 'react'
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
  getPartsByUuid,
  LengthDirection,
  PartTransitionType,
  PartValue,
  useAppDispatch,
  Uuid,
} from 'src'

export function usePartActions(uuid: Uuid) {
  const dispatch = useAppDispatch()

  const partsByUuid = useSelector(getPartsByUuid)
  // @ts-ignore
  const part = partsByUuid[uuid] as PartValue
  const { stateBeforeTransition } = part

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
    (delta: number, lengthDirection: LengthDirection) => {
      if (stateBeforeTransition == null) return
      const { length, origin, direction } = stateBeforeTransition

      // special case: length must not go below zero
      if (length + delta < 1) {
        delta = -length + 1
      }

      if (lengthDirection === LengthDirection.positive) {
        dispatch(
          doUpdatePartTransition({
            update: 'add',
            path: 'length',
            value: delta,
          }),
        )
      } else if (lengthDirection === LengthDirection.negative) {
        const moveX = delta * direction.x
        const moveY = delta * direction.y
        let moveZ = delta * direction.z

        // special case: origin.z must not go below zero
        if (origin.z - moveZ <= 0) {
          moveZ = origin.z
          delta = origin.z / direction.z
        }

        dispatch(
          doUpdatePartTransition([
            // update length by change
            {
              update: 'add',
              path: 'length',
              value: delta,
            },
            // move forward by change
            {
              update: 'sub',
              path: ['origin', 'x'],
              value: moveX,
            },
            {
              update: 'sub',
              path: ['origin', 'y'],
              value: moveY,
            },
            {
              update: 'sub',
              path: ['origin', 'z'],
              value: moveZ,
            },
          ]),
        )
      }
    },
    [stateBeforeTransition, dispatch],
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
