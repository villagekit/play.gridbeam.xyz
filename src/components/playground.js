import React from 'react'
import { useSelector, useStore } from 'react-redux'
import styled from 'styled-components'

import Sidebar from './sidebar'
import Actions from './action'
import SelectionBox from './selection-box'
import Vis from './vis'
import Keyboard from './keyboard'

export default GridBeamPlayground

function GridBeamPlayground ({ defaultParts }) {
  const { select, dispatch } = useStore()

  const rawParts = useSelector(select.parts.raw)
  const isLoading = useSelector(select.persist.isLoading)
  const isLoaded = useSelector(select.persist.isLoaded)
  const savedHash = useSelector(select.persist.savedHash)

  const [numSaving, setNumSaving] = React.useState(0)
  const isSaving = numSaving > 0

  React.useEffect(() => {
    if (isLoading || isSaving) return
    if (!isLoaded) dispatch.persist.loadParts(defaultParts)
    else dispatch.persist.saveParts(rawParts)

    return () => window.removeEventListener('hashchange', onHashChange)

    function onHashChange () {
      if (isSaving) {
        setNumSaving(value => value - 1)
        return
      }
      if (window.location.hash !== savedHash) {
        dispatch.persist.loadParts()
      }
    }
  }, [isSaving, isLoading, isLoaded, rawParts, defaultParts, savedHash])

  if (rawParts == null) return null

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

const Container = styled.div({
  margin: '0',
  padding: '0',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  userSelect: 'none'
})
