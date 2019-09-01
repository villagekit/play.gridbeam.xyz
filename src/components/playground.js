const React = require('react')
const { complement, prop } = require('ramda')
const { default: styled } = require('styled-components')

const useModelStore = require('../stores/model')
const useSelectionStore = require('../stores/selection')

const Sidebar = require('./sidebar')
const ActionButton = require('./action')
const SelectionBox = require('./selection-box')
const Vis = require('./vis')
const Keyboard = require('./keyboard')

module.exports = GridBeamPlayground

function GridBeamPlayground ({ defaultParts }) {
  const parts = useModelStore(prop('parts'))
  const setParts = useModelStore(prop('setParts'))
  const isLoaded = useModelStore(prop('isLoaded'))
  const setLoaded = useModelStore(prop('setLoaded'))
  const loadParts = useModelStore(prop('loadParts'))
  const saveParts = useModelStore(prop('saveParts'))
  const completeSave = useModelStore(prop('completeSave'))

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
      <Sidebar />
      <ActionButton />
      <SelectionBox />
      <Vis />
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
