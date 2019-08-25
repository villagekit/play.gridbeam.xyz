const React = require('react')
const { DEFAULT_BEAM_WIDTH } = require('gridbeam-csg')
const { complement, prop } = require('ramda')
const { default: styled } = require('styled-components')

console.log('DEFAULT_BEAM_WIDTH', DEFAULT_BEAM_WIDTH)

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

  const hoveredUuids = Object.keys(useModelStore(prop('hoveredUuids')))
  const selectedUuids = Object.keys(useModelStore(prop('selectedUuids')))
  const isHoveredAndSelected =
    hoveredUuids.length > 0 &&
    hoveredUuids.reduce((sofar, hoveredUuid) => {
      return sofar && selectedUuids.includes(hoveredUuid)
    }, true)
  const selected = useModelStore(state => {
    return Object.keys(state.selectedUuids).map(uuid => parts[uuid])
  })
  const isNotSelecting = useSelectionStore(complement(prop('isSelecting')))
  // const disableSelectionBox = isNotSelecting && selected.length > 0
  // const disableSelectionBox = isHoveredAndSelected

  React.useEffect(() => {
    if (!isLoaded) loadParts(setParts, setLoaded)
    else if (parts == null) setParts(defaultParts)
    else saveParts(parts)
  }, [isLoaded, loadParts, setParts, setLoaded, parts, defaultParts, saveParts])

  if (parts == null) return null

  return (
    <Container>
      {/* <Sidebar /> */}
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
  flexWrap: 'nowrap'
})
