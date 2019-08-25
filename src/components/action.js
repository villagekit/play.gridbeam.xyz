const React = require('react')
const { prop } = require('ramda')
const { Button } = require('rebass/styled-components')

const useModelStore = require('../stores/model')

module.exports = ActionButton

function ActionButton (props) {
  const addPart = useModelStore(prop('addPart'))

  return (
    <Button
      ml={3}
      mb={3}
      css={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        zIndex: 1
      }}
      bg='primary'
      onClick={handleClick}
    >
      Add Beam
    </Button>
  )

  function handleClick (ev) {
    addPart({
      type: 'beam',
      direction: 'x',
      length: 5,
      origin: [0, 0, 0]
    })
  }
}
