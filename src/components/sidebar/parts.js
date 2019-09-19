import React from 'react'
import { Box, Flex, Text } from 'rebass/styled-components'
import { length, pipe, groupBy, path, map, sum } from 'ramda'
import useModelStore from '../../stores/model'
import { selectPartsByType } from '../../selectors/parts'

export default Parts

function Parts (props) {
  const partsByType = useModelStore(selectPartsByType)

  console.log('partsByType', partsByType)

  return (
    <PartsContainer>
      <Text as='h2' fontSize={4}>
        Parts
      </Text>
      <BeamSummary beams={partsByType.beam} />
    </PartsContainer>
  )
}

function PartsContainer (props) {
  return <Box p={3} {...props} />
}

function BeamSummary (props) {
  const { beams } = props
  const numBeams = beams.length
  const totalLength = calculateTotalLength(beams)
  const numBeamsByLength = calculateNumBeamsByLength(beams)

  return (
    <Box as='section' p={3}>
      <Box as='header'>
        <Text as='h3' fontSize={3}>
          Beams
        </Text>
      </Box>
      <Box
        as='dl'
        sx={{
          display: 'grid',
          gridTemplateColumns: 'max-content auto',
          padding: 2,

          dt: {
            padding: 2,
            gridColumnStart: 1
          },
          dd: {
            padding: 2,
            gridColumnStart: 2
          }
        }}
      >
        <dt>Total quantity</dt>
        <dd>{numBeams} beams</dd>
        <dt>Total length</dt>
        <dd>{totalLength} holes</dd>
        <dt>Quantity by length</dt>
        <dd>
          <Box
            as='table'
            sx={{
              tr: {
                py: 2
              },
              th: {
                textAlign: 'center',
                paddingRight: 3,
                fontWeight: 'bold'
              },
              td: {
                textAlign: 'center',
                paddingRight: 3,
                py: 2
              }
            }}
          >
            <tr>
              <th>Length</th>
              <th>Quantity</th>
            </tr>
            {Object.entries(numBeamsByLength).map(
              ([length, numBeamsOfLength]) => (
                <tr>
                  <td>{length} holes</td>
                  <td>{numBeamsOfLength}</td>
                </tr>
              )
            )}
          </Box>
        </dd>
      </Box>
    </Box>
  )
}

const calculateTotalLength = pipe(
  map(path(['value', 'length'])),
  sum
)

const calculateNumBeamsByLength = pipe(
  groupBy(path(['value', 'length'])),
  map(length)
)
