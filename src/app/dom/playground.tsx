import { values } from 'lodash'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  doAsyncLoadModel,
  doAsyncSaveModel,
  DomActionButtons,
  DomCameraWidget,
  DomSelectionBox,
  DomSidebar,
  getCurrentSpecId,
  getIsLoaded,
  getIsLoading,
  getPartsEntities,
  getSavedHash,
  GlScene,
  ModelEntity,
  useApp,
} from 'src'
import { Box } from 'theme-ui'

interface AppProps {
  defaultModel: ModelEntity
}

export function DomApp({ defaultModel }: AppProps) {
  useApp()

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
    else if (parts != null && specId != null) {
      dispatch(doAsyncSaveModel({ parts: values(parts), specId }))
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
      <GlScene />
      <DomSidebar />
      <DomActionButtons />
      <DomSelectionBox />
      <DomCameraWidget />
    </Container>
  )
}

interface ContainerProps extends React.ComponentProps<typeof Box> {}

const Container = (props: ContainerProps) => (
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
