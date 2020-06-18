import { keys, values } from 'lodash'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  doSetPartsClipboard,
  doUpdateParts,
  getPartsClipboard,
  getSelectedPartsEntities,
} from 'src'
import { MathUtils } from 'three'

export const useClipboard = () => {
  const dispatch = useDispatch()

  const selectedParts = useSelector(getSelectedPartsEntities)
  const clipboard = useSelector(getPartsClipboard)

  const cut = useCallback(() => {
    dispatch(doSetPartsClipboard(values(selectedParts)))
    dispatch(
      doUpdateParts({
        type: 'delete',
        payload: {
          uuids: keys(selectedParts),
        },
      }),
    )
  }, [dispatch, selectedParts])

  const copy = useCallback(() => {
    dispatch(doSetPartsClipboard(values(selectedParts)))
  }, [dispatch, selectedParts])

  const paste = useCallback(() => {
    dispatch(
      doUpdateParts({
        type: 'create',
        payload: {
          uuids: clipboard.map(() => MathUtils.generateUUID()),
          parts: clipboard,
        },
      }),
    )
  }, [clipboard, dispatch])

  return { cut, copy, paste }
}
