import React from 'react'
import { complement, prop } from 'ramda'
import { default as styled } from 'styled-components'

import useModelStore from '../stores/model'
import Sidebar from './sidebar'
import Actions from './action'
import SelectionBox from './selection-box'
import Vis from './vis'
import Keyboard from './keyboard'

export default GridBeamPlayground

function GridBeamPlayground ({ defaultParts }) {
  const parts = useModelStore(prop('parts'))
  const setParts = useModelStore(prop('setParts'))
  const isLoaded = useModelStore(prop('isLoaded'))
  const setLoaded = useModelStore(prop('setLoaded'))
  const loadParts = useModelStore(prop('loadParts'))
  const saveParts = useModelStore(prop('saveParts'))

  const [hash, setHash] = React.useState('')
  React.useEffect(() => {}, [hash])

  const [numSaving, setNumSaving] = React.useState(0)
  const isSaving = numSaving > 0

  React.useEffect(() => {
    if (isSaving) return
    if (!isLoaded) loadParts(setParts, setLoaded)
    else if (parts == null) setParts(defaultParts)
    else saveParts(parts, setHash)

    return () => window.removeEventListener('hashchange', onHashChange)

    function onHashChange () {
      if (isSaving) {
        setNumSaving(value => value - 1)
        return
      }
      console.log('hash change', window.location.hash)
      if (window.location.hash !== hash) {
        loadParts(setParts, setLoaded)
      }
    }
  }, [
    isSaving,
    isLoaded,
    loadParts,
    setParts,
    setLoaded,
    parts,
    defaultParts,
    saveParts,
    setHash,
    hash
  ])

  if (parts == null) return null

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
