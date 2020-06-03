import { useCallback } from 'react'
import {
  ArrowDirection,
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
  LengthDirection,
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
    (delta: number, direction: LengthDirection) => {
      dispatch(
        doUpdatePartTransition({
          update: 'add',
          path: 'length',
          value: delta,
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

/*
  const handleLengthChange = useCallback(
    (change: number) => {
      if (arrowDirection === ArrowDirection.positive) {
        updatePart([
          // update length by change
          {
            update: 'add',
            path: 'length',
            value: change,
          },
        ])
      } else if (arrowDirection === ArrowDirection.negative) {
        // TODO tidy this up
        let beamDirectionAxis
        if (Math.abs(beamDirection.x) === 1) beamDirectionAxis = 'x'
        else if (Math.abs(beamDirection.y) === 1) beamDirectionAxis = 'y'
        else if (Math.abs(beamDirection.z) === 1) beamDirectionAxis = 'z'
        if (beamDirectionAxis === undefined)
          throw new Error('incorrect beam direction axis')

        if (beamDirectionAxis === 'z' && change > 0) {
          change = Math.min(change, beamOrigin.z)
        }

        let beamDirectionUpdate = 'sub'
        if (
          beamDirection.x === -1 ||
          beamDirection.y === -1 ||
          beamDirection.z === -1
        ) {
          beamDirectionUpdate = 'add'
        }
        updatePart([
          // update length by change
          {
            update: 'add',
            path: 'length',
            value: change,
          },
          // move forward by change
          {
            update: beamDirectionUpdate,
            path: ['origin', beamDirectionAxis],
            value: change,
          },
        ])
      }
    },
    [
      arrowDirection,
      beamDirection.x,
      beamDirection.y,
      beamDirection.z,
      beamOrigin,
      updatePart,
    ],
  )
*/
