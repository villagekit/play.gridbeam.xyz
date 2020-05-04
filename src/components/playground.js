import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box } from 'theme-ui'

import {
  doAsyncLoadModel,
  doAsyncSaveModel,
  getCurrentSpecId,
  getIsLoaded,
  getIsLoading,
  getPartsEntities,
  getSavedHash,
} from '../store'
import Actions from './action'
import Keyboard from './keyboard'
import SelectionBox from './selection-box'
import Sidebar from './sidebar'
import Vis from './vis'

export default GridBeamPlayground

function GridBeamPlayground({ defaultModel }) {
  const dispatch = useDispatch()

  const parts = useSelector(getPartsEntities)
  const specId = useSelector(getCurrentSpecId)
  const isLoading = useSelector(getIsLoading)
  const isLoaded = useSelector(getIsLoaded)
  const savedHash = useSelector(getSavedHash)

  const [numSaving, setNumSaving] = React.useState(0)
  const isSaving = numSaving > 0

  React.useEffect(() => {
    if (isLoading || isSaving) return
    if (!isLoaded) dispatch(doAsyncLoadModel(defaultModel))
    else dispatch(doAsyncSaveModel({ parts, specId }))

    return () => window.removeEventListener('hashchange', onHashChange)

    function onHashChange() {
      if (isSaving) {
        setNumSaving((value) => value - 1)
        return
      }
      if (window.location.hash !== savedHash) {
        dispatch(doAsyncLoadModel())
      }
    }
  }, [
    isSaving,
    isLoading,
    isLoaded,
    parts,
    defaultModel,
    savedHash,
    dispatch,
    specId,
  ])

  if (parts == null || specId == null) return null

  return (
    <Container>
      <Vis />
      <Sidebar />
      <Actions />
      <SelectionBox />
      <Keyboard />
    </Container>
  )
}

const Container = (props) => (
  <Box
    sx={{
      background: 'white',
      margin: '0',
      padding: '0',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      userSelect: 'none',
    }}
    {...props}
  />
)
