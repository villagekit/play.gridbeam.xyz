import { values } from 'lodash'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  AxisDirection,
  directionByAxis,
  doAsyncLoadModel,
  doAsyncSaveModel,
  getCurrentSpecId,
  getIsLoaded,
  getIsLoading,
  getPartsEntities,
  getSavedHash,
  MaterialId,
  ModelEntity,
  PartType,
  SizeId,
  SpecId,
} from 'src'

const defaultModel = (): ModelEntity => ({
  specId: SpecId.og,
  parts: [
    {
      type: PartType.Beam,
      sizeId: SizeId['1.5in'],
      materialId: MaterialId.Wood,
      origin: {
        x: 0,
        y: 1,
        z: 1,
      },
      direction: directionByAxis[AxisDirection.X],
      length: 4,
    },
    {
      type: PartType.Beam,
      sizeId: SizeId['1.5in'],
      materialId: MaterialId.Wood,
      origin: {
        x: 1,
        y: 0,
        z: 2,
      },
      direction: directionByAxis[AxisDirection.Y],
      length: 6,
    },
    {
      type: PartType.Beam,
      sizeId: SizeId['1.5in'],
      materialId: MaterialId.Wood,
      origin: {
        x: 0,
        y: 0,
        z: 0,
      },
      direction: directionByAxis[AxisDirection.Z],
      length: 10,
    },
  ],
})

export function usePersist() {
  const dispatch = useDispatch()

  const parts = useSelector(getPartsEntities)
  const specId = useSelector(getCurrentSpecId)
  const isLoading = useSelector(getIsLoading)
  const isLoaded = useSelector(getIsLoaded)
  const savedHash = useSelector(getSavedHash)

  const [numSaving, setNumSaving] = useState(0)
  const isSaving = numSaving > 0

  useEffect(() => {
    if (isLoading || isSaving) return
    if (!isLoaded) dispatch(doAsyncLoadModel(defaultModel()))
    else if (parts != null && specId != null) {
      const nextModel: ModelEntity = { parts: values(parts), specId }
      dispatch(doAsyncSaveModel(nextModel))
    }

    return () => window.removeEventListener('hashchange', onHashChange)

    function onHashChange() {
      if (isSaving) {
        setNumSaving((value) => value - 1)
        return
      }
      if (window.location.hash !== savedHash) {
        dispatch(doAsyncLoadModel(null))
      }
    }
  }, [isSaving, isLoading, isLoaded, parts, savedHash, dispatch, specId])
}
